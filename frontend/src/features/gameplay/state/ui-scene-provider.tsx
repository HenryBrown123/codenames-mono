import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useGameData } from "./game-data-provider";
import { useTurn } from "./active-turn-provider";
import { DeviceHandoffOverlay } from "../device-handoff";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";
import { getStateMachine } from "./ui-state-config";
import { evaluateConditions } from "./ui-state-conditions";

type SceneAction =
  | { type: "TRIGGER_TRANSITION"; payload: { event: string } }
  | { type: "COMPLETE_ROLE_TRANSITION" };

interface PlayerRoleSceneContextValue {
  currentRole: string;
  currentScene: string;
  dispatch: (action: SceneAction) => void;
}

const PlayerRoleSceneContext = createContext<
  PlayerRoleSceneContextValue | undefined
>(undefined);

interface PlayerRoleSceneProviderProps {
  children: ReactNode;
}

export const PlayerRoleSceneProvider: React.FC<
  PlayerRoleSceneProviderProps
> = ({ children }) => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();
  const [currentRole, setCurrentRole] = useState<PlayerRole>(PLAYER_ROLE.NONE);
  const [currentScene, setCurrentScene] = useState("lobby");
  const [showHandoff, setShowHandoff] = useState(true);
  const [pendingTransition, setPendingTransition] = useState<{
    stage: PlayerRole;
    scene: string;
  } | null>(null);

  const initiateRoleTransition = useCallback(() => {
    console.log("[PLAYER_ROLE_SCENE] Initiating role transition");

    if (gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
      const serverRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
      const stateMachine = getStateMachine(serverRole);

      // Set up the pending transition
      setPendingTransition({
        stage: serverRole,
        scene: stateMachine.initial,
      });
      setShowHandoff(true);
    } else {
      const serverRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
      setCurrentRole(serverRole);
    }
  }, [gameData.gameType, gameData.playerContext?.role]);

  const completeRoleTransition = useCallback(() => {
    if (!pendingTransition) {
      console.warn("[PLAYER_ROLE_SCENE] No pending transition to complete");
      return;
    }

    console.log(
      `[PLAYER_ROLE_SCENE] Completing role transition to ${pendingTransition.stage} → ${pendingTransition.scene}`,
    );

    setShowHandoff(false);
    setCurrentRole(pendingTransition.stage);
    setCurrentScene(pendingTransition.scene);
    setPendingTransition(null);
  }, [pendingTransition]);

  const handleSceneTransition = useCallback(
    (event: string) => {
      const stateMachine = getStateMachine(currentRole);
      const currentSceneConfig = stateMachine.scenes[currentScene];

      if (!currentSceneConfig?.on?.[event]) {
        console.log(
          `[PLAYER_ROLE_SCENE] No transitions for event: ${event} in ${currentRole}/${currentScene}`,
        );
        return;
      }

      console.log(
        `[PLAYER_ROLE_SCENE] Processing event: ${event} in ${currentRole}/${currentScene}`,
      );

      const transitions = currentSceneConfig.on[event];
      const matchingTransition = findMatchingTransition(
        transitions,
        gameData,
        activeTurn,
      );

      if (!matchingTransition) {
        console.log(
          `[PLAYER_ROLE_SCENE] No valid transition found for: ${event}`,
        );
        return;
      }

      console.log(
        `[PLAYER_ROLE_SCENE] Executing transition:`,
        matchingTransition,
      );

      // Handle role completion
      if (matchingTransition.type === "END") {
        console.log(`[PLAYER_ROLE_SCENE] Role ${currentRole} signaling END`);
        initiateRoleTransition();
        return;
      }

      // Handle scene transition within role
      if (matchingTransition.type === "scene" && matchingTransition.target) {
        console.log(
          `[PLAYER_ROLE_SCENE] Scene transition: ${currentScene} → ${matchingTransition.target}`,
        );
        setCurrentScene(matchingTransition.target);
        return;
      }

      console.warn(
        `[PLAYER_ROLE_SCENE] Unknown transition type:`,
        matchingTransition,
      );
    },
    [currentRole, currentScene, initiateRoleTransition, gameData, activeTurn],
  );

  const dispatch = useCallback(
    (action: SceneAction) => {
      switch (action.type) {
        case "TRIGGER_TRANSITION":
          handleSceneTransition(action.payload.event);
          break;
        case "COMPLETE_ROLE_TRANSITION":
          completeRoleTransition();
          break;
        default:
          console.warn(`[PLAYER_ROLE_SCENE] Unknown action type:`, action);
      }
    },
    [handleSceneTransition, completeRoleTransition],
  );

  const contextValue: PlayerRoleSceneContextValue = {
    currentRole,
    currentScene,
    dispatch,
  };

  return (
    <PlayerRoleSceneContext.Provider value={contextValue}>
      {showHandoff && pendingTransition && (
        <DeviceHandoffOverlay
          gameData={gameData}
          pendingTransition={pendingTransition}
          onContinue={() => dispatch({ type: "COMPLETE_ROLE_TRANSITION" })}
        />
      )}
      {children}
    </PlayerRoleSceneContext.Provider>
  );
};

export const usePlayerRoleScene = (): PlayerRoleSceneContextValue => {
  const context = useContext(PlayerRoleSceneContext);
  if (context === undefined) {
    throw new Error(
      "usePlayerRoleScene must be used within PlayerRoleSceneProvider",
    );
  }
  return context;
};

const findMatchingTransition = (
  transitions: any,
  gameData: GameData,
  activeTurn: TurnData | null,
): any => {
  if (Array.isArray(transitions)) {
    for (const transition of transitions) {
      if (transition.condition && gameData) {
        const conditionsArray = Array.isArray(transition.condition)
          ? transition.condition
          : [transition.condition];

        const allPass = conditionsArray.every((conditionKey: string) =>
          evaluateConditions(conditionKey, gameData, activeTurn),
        );

        if (allPass) {
          return transition;
        }
      } else if (!transition.condition) {
        return transition;
      }
    }
    return null;
  } else {
    if (transitions.condition && gameData) {
      const passes = evaluateConditions(
        transitions.condition,
        gameData,
        activeTurn,
      );
      return passes ? transitions : null;
    }
    return transitions;
  }
};
