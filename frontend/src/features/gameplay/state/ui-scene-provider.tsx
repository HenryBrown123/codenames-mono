// features/gameplay/state/player-role-scene-provider.tsx
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

  const initiateRoleTransition = useCallback(() => {
    console.log("[PLAYER_ROLE_SCENE] Initiating role transition");

    if (gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
      setCurrentRole(PLAYER_ROLE.NONE);
      setShowHandoff(true);
    } else {
      const serverRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
      setCurrentRole(serverRole);
    }
  }, [gameData.gameType, gameData.playerContext?.role]);

  const completeRoleTransition = useCallback(() => {
    const serverRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
    const stateMachine = getStateMachine(serverRole, initiateRoleTransition);

    console.log(
      `[PLAYER_ROLE_SCENE] Completing role transition to ${serverRole} → ${stateMachine.initial}`,
    );
    setShowHandoff(false);
    setCurrentRole(serverRole);
    setCurrentScene(stateMachine.initial);
  }, [gameData.playerContext?.role]);

  const handleSceneTransition = useCallback(
    (event: string) => {
      const stateMachine = getStateMachine(currentRole, initiateRoleTransition);
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
      {showHandoff && (
        <DeviceHandoffOverlay
          onHandoffComplete={() =>
            dispatch({ type: "COMPLETE_ROLE_TRANSITION" })
          }
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
