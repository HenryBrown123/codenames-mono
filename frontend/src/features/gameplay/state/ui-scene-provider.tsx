import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useEffect,
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
  showHandoff: boolean;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  } | null;
  dispatch: (action: SceneAction) => void;
}

const PlayerRoleSceneContext = createContext<
  PlayerRoleSceneContextValue | undefined
>(undefined);

interface PlayerRoleSceneProviderProps {
  children: ReactNode;
}

/**
 * Determines the correct role based on actual game state
 * This is the SINGLE SOURCE OF TRUTH for role determination
 */
const determineCorrectRole = (gameData: GameData): PlayerRole => {
  console.log("[ROLE_DETERMINATION] Evaluating game state:", {
    gameStatus: gameData.status,
    roundStatus: gameData.currentRound?.status,
    roundExists: !!gameData.currentRound,
    cardsDealt: gameData.currentRound?.cards?.length || 0,
    playerContextRole: gameData.playerContext?.role,
  });

  // Game not started = lobby
  if (gameData.status !== "IN_PROGRESS") {
    console.log("[ROLE_DETERMINATION] Game not in progress -> NONE");
    return PLAYER_ROLE.NONE;
  }

  // No round = lobby
  if (!gameData.currentRound) {
    console.log("[ROLE_DETERMINATION] No current round -> NONE");
    return PLAYER_ROLE.NONE;
  }

  // Round in setup (no cards or not started) = lobby
  if (gameData.currentRound.status === "SETUP") {
    console.log("[ROLE_DETERMINATION] Round in setup -> NONE");
    return PLAYER_ROLE.NONE;
  }

  // Round completed = lobby (waiting for next round)
  if (gameData.currentRound.status === "COMPLETED") {
    console.log("[ROLE_DETERMINATION] Round completed -> NONE");
    return PLAYER_ROLE.NONE;
  }

  // Round is IN_PROGRESS = use player's assigned role
  if (gameData.currentRound.status === "IN_PROGRESS") {
    const assignedRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
    console.log(
      "[ROLE_DETERMINATION] Round in progress -> using assigned role:",
      assignedRole,
    );
    return assignedRole;
  }

  // Default fallback
  console.log("[ROLE_DETERMINATION] Fallback -> NONE");
  return PLAYER_ROLE.NONE;
};

/**
 * Checks if a role transition requires device handoff
 */
const requiresDeviceHandoff = (
  currentRole: PlayerRole,
  newRole: PlayerRole,
  gameData: GameData,
): boolean => {
  const needsHandoff =
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    currentRole !== newRole &&
    newRole !== PLAYER_ROLE.NONE &&
    newRole !== PLAYER_ROLE.SPECTATOR;

  console.log("[ROLE_DETERMINATION] Handoff check:", {
    currentRole,
    newRole,
    gameType: gameData.gameType,
    needsHandoff,
  });

  return needsHandoff;
};

export const PlayerRoleSceneProvider: React.FC<
  PlayerRoleSceneProviderProps
> = ({ children }) => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();

  const [currentRole, setCurrentRole] = useState<PlayerRole>(PLAYER_ROLE.NONE);
  const [currentScene, setCurrentScene] = useState("lobby");
  const [showHandoff, setShowHandoff] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{
    stage: PlayerRole;
    scene: string;
  } | null>(null);

  /**
   * Initialize role on mount and when game state changes
   */
  useEffect(() => {
    const targetRole = determineCorrectRole(gameData);

    if (requiresDeviceHandoff(currentRole, targetRole, gameData)) {
      const stateMachine = getStateMachine(targetRole);
      setPendingTransition({
        stage: targetRole,
        scene: stateMachine.initial,
      });
      setShowHandoff(true);
    } else {
      // Direct transition - no handoff needed
      setCurrentRole(targetRole);
      const stateMachine = getStateMachine(targetRole);
      setCurrentScene(stateMachine.initial);
      setShowHandoff(false);
      setPendingTransition(null);
    }
  }, [
    gameData.status,
    gameData.currentRound?.status,
    gameData.currentRound?.roundNumber,
    gameData.playerContext?.role,
    currentRole,
  ]);

  const initiateRoleTransition = useCallback(() => {
    console.log("[PLAYER_ROLE_SCENE] Initiating role transition");
    const serverRole = determineCorrectRole(gameData);

    if (requiresDeviceHandoff(currentRole, serverRole, gameData)) {
      const stateMachine = getStateMachine(serverRole);
      setPendingTransition({
        stage: serverRole,
        scene: stateMachine.initial,
      });
      setShowHandoff(true);
    } else {
      // Direct transition
      setCurrentRole(serverRole);
      const stateMachine = getStateMachine(serverRole);
      setCurrentScene(stateMachine.initial);
    }
  }, [gameData, currentRole]);

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
    showHandoff,
    pendingTransition,
    dispatch,
  };

  return (
    <PlayerRoleSceneContext.Provider value={contextValue}>
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
