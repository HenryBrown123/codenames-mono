// frontend/src/gameplay/role-scenes/scene.provider.tsx
import React, { useCallback, createContext, useContext, ReactNode, useReducer } from "react";
import { useGameData } from "../game-data";
import { useTurn } from "../turn-management";
import { usePlayerContext } from "../player-context/player-context.provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { getStateMachine } from "./scene-config";

interface PlayerSceneState {
  currentRole: PlayerRole;
  currentScene: string;
  requiresHandoff: boolean;
}

type SceneAction =
  | { type: "SCENE_TRANSITION"; payload: { event: string } }
  | { type: "ROLE_CHANGED"; payload: { role: PlayerRole; scene: string } };

interface PlayerSceneContextValue {
  currentRole: string;
  currentScene: string;
  requiresHandoff: boolean;
  triggerSceneTransition: (event: string) => void;
  completeHandoff: (playerId: string) => void;
  isInitialScene: boolean;
}

const PlayerSceneContext = createContext<PlayerSceneContextValue | undefined>(undefined);

interface PlayerSceneProviderProps {
  children: ReactNode;
  onTurnComplete?: () => void;
}

/**
 * Scene reducer - handles transitions without complex conditions
 */
const sceneReducer = (state: PlayerSceneState, action: SceneAction): PlayerSceneState => {
  switch (action.type) {
    case "SCENE_TRANSITION": {
      const event = action.payload.event;
      const stateMachine = getStateMachine(state.currentRole);
      const currentSceneConfig = stateMachine.scenes[state.currentScene];

      if (!currentSceneConfig?.on?.[event]) {
        console.log(
          `[SCENE_REDUCER] No transition for event ${event} in ${state.currentRole}.${state.currentScene}`,
        );
        return state;
      }

      const transition = currentSceneConfig.on[event];

      // Simple transitions - no conditions!
      if (transition.type === "scene" && transition.target) {
        console.log(`[SCENE_REDUCER] Transitioning to ${transition.target}`);
        return {
          ...state,
          currentScene: transition.target,
        };
      }

      // END transitions are handled by the provider
      return state;
    }

    case "ROLE_CHANGED": {
      console.log(`[SCENE_REDUCER] Role changed to ${action.payload.role}`);
      return {
        currentRole: action.payload.role,
        currentScene: action.payload.scene,
        requiresHandoff: false,
      };
    }

    default:
      return state;
  }
};

/**
 * Determines initial scene state based on game context
 */
const determineInitialSceneState = (gameData: GameData): PlayerSceneState => {
  const playerRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;
  const stateMachine = getStateMachine(playerRole);

  const requiresHandoff =
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    gameData.currentRound?.status === "IN_PROGRESS" &&
    playerRole === PLAYER_ROLE.NONE;

  return {
    currentRole: playerRole,
    currentScene: stateMachine.initial,
    requiresHandoff: requiresHandoff,
  };
};

export const PlayerSceneProvider: React.FC<PlayerSceneProviderProps> = ({
  children,
  onTurnComplete,
}) => {
  const { gameData } = useGameData();
  const { setCurrentPlayerId } = usePlayerContext();

  const [sceneState, dispatch] = useReducer(sceneReducer, gameData, determineInitialSceneState);

  // Sync with server role changes
  const currentState = React.useMemo(() => {
    const serverRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;

    // If role changed, update state
    if (sceneState.currentRole !== serverRole) {
      const stateMachine = getStateMachine(serverRole);
      dispatch({
        type: "ROLE_CHANGED",
        payload: { role: serverRole, scene: stateMachine.initial },
      });

      // Return new state immediately
      return {
        currentRole: serverRole,
        currentScene: stateMachine.initial,
        requiresHandoff: determineInitialSceneState(gameData).requiresHandoff,
      };
    }

    // Otherwise check handoff status
    return {
      ...sceneState,
      requiresHandoff: determineInitialSceneState(gameData).requiresHandoff,
    };
  }, [gameData, sceneState]);

  /**
   * Triggers scene transitions based on events from actions
   */
  const triggerSceneTransition = useCallback(
    (event: string) => {
      console.log(
        `[SCENE] triggerSceneTransition: ${event}, role: ${currentState.currentRole}, scene: ${currentState.currentScene}`,
      );

      const stateMachine = getStateMachine(currentState.currentRole);
      const currentSceneConfig = stateMachine.scenes[currentState.currentScene];
      const transition = currentSceneConfig?.on?.[event];

      if (!transition) {
        console.log(`[SCENE] No transition found for event: ${event}`);
        return;
      }

      console.log(`[SCENE] Found transition type: ${transition.type}`);

      // END transitions trigger turn completion
      if (transition.type === "END") {
        console.log(`[SCENE] Triggering onTurnComplete callback`);
        onTurnComplete?.();
        return;
      }

      // Scene transitions go through reducer
      dispatch({ type: "SCENE_TRANSITION", payload: { event } });
    },
    [currentState, onTurnComplete],
  );

  /**
   * Completes device handoff by setting the new active player
   */
  const completeHandoff = useCallback(
    (playerId: string) => {
      console.log(`[SCENE] completeHandoff called with playerId: ${playerId}`);
      setCurrentPlayerId(playerId);
    },
    [setCurrentPlayerId],
  );

  // Determine if at the initial scene for current role
  const isInitialScene = React.useMemo(() => {
    const stateMachine = getStateMachine(currentState.currentRole);
    return currentState.currentScene === stateMachine.initial;
  }, [currentState.currentRole, currentState.currentScene]);

  const contextValue: PlayerSceneContextValue = {
    currentRole: currentState.currentRole,
    currentScene: currentState.currentScene,
    requiresHandoff: currentState.requiresHandoff,
    triggerSceneTransition,
    completeHandoff,
    isInitialScene,
  };

  return <PlayerSceneContext.Provider value={contextValue}>{children}</PlayerSceneContext.Provider>;
};

export const usePlayerScene = (): PlayerSceneContextValue => {
  const context = useContext(PlayerSceneContext);
  if (context === undefined) {
    throw new Error("usePlayerScene must be used within PlayerSceneProvider");
  }
  return context;
};
