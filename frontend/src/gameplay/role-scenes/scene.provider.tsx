/**
 * Player Scene Provider
 *
 * Orchestrates the UI flow for each player's turn in Codenames, managing scene
 * transitions and handoffs between players in single-device mode.
 *
 * Domain Concepts:
 * - Each player turn follows a scene-based flow (e.g., give clue → wait → outcome)
 * - Scenes are grouped by player role (Codemaster, Codebreaker, None)
 * - When a turn ends, the game transitions to the next active player
 *
 * Single-Device Flow:
 * 1. Player completes their turn → scene reaches END state
 * 2. Provider triggers onTurnComplete callback
 * 3. Parent clears player context → game returns to NONE state
 * 4. Handoff UI shows next active player
 * 5. Player selection → new turn begins with appropriate scene
 *
 * Multi-Device Flow:
 * - Each device maintains its own player context
 * - END transitions reset to initial scene (no handoff needed)
 *
 * This provider works with:
 * - PlayerProvider: Manages current player identity
 * - GameDataProvider: Supplies game state and player role
 * - GameActionsProvider: Handles player actions that trigger scene changes
 */

import React, {
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
} from "react";
import { useGameDataRequired } from "../game-data/game-data.provider";
import { usePlayerContext } from "../player-context/player-context.provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { getStateMachine } from "./scene-config";

interface PlayerSceneState {
  currentRole: PlayerRole;
  currentScene: string;
  requiresHandoff: boolean;
}

type SceneAction = { type: "SCENE_TRANSITION"; payload: { event: string } };

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
 * Scene reducer - manages transitions within a player's turn
 * Now uses explicit events without conditions
 */
const sceneReducer = (state: PlayerSceneState, action: SceneAction): PlayerSceneState => {
  console.log("[REDUCER] Current state:", state, "Action:", action);

  switch (action.type) {
    case "SCENE_TRANSITION": {
      const event = action.payload.event;
      const stateMachine = getStateMachine(state.currentRole);
      const currentSceneConfig = stateMachine.scenes[state.currentScene];

      if (!currentSceneConfig?.on?.[event]) {
        console.log("[REDUCER] No transition found for event:", event);
        return state;
      }

      const transition = currentSceneConfig.on[event];

      // Scene transitions update the current scene
      // END transitions are handled by triggerSceneTransition
      if (transition.type === "scene" && transition.target) {
        const newState = {
          ...state,
          currentScene: transition.target,
        };
        console.log("[REDUCER] New state:", newState);
        return newState;
      }

      return state;
    }

    default:
      return state;
  }
};

/**
 * Determines initial scene state based on game context
 * Called on mount and when player context changes
 */
const determineInitialSceneState = (gameData: GameData): PlayerSceneState => {
  // Get current player's role from game data
  const playerRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;
  const stateMachine = getStateMachine(playerRole);

  // In single-device mode, show handoff if game is active but no player selected
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
  const { gameData } = useGameDataRequired();
  const { setCurrentPlayerId } = usePlayerContext();

  useEffect(() => {
    console.log("[PlayerSceneProvider] MOUNTED");
    return () => console.log("[PlayerSceneProvider] UNMOUNTED");
  }, []);

  // Initialize reducer only once
  const [sceneState, dispatch] = useReducer(sceneReducer, undefined, () =>
    determineInitialSceneState(gameData),
  );

  // Check if we need handoff (computed, not stored)
  const requiresHandoff =
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    gameData.currentRound?.status === "IN_PROGRESS" &&
    (gameData.playerContext?.role || PLAYER_ROLE.NONE) === PLAYER_ROLE.NONE;

  /**
   * Triggers scene transitions and handles turn completion
   * END transitions invoke the onTurnComplete callback
   */
  const triggerSceneTransition = (event: string) => {
    console.log(
      `[SCENE] triggerSceneTransition: ${event}, role: ${sceneState.currentRole}, scene: ${sceneState.currentScene}`,
    );

    const stateMachine = getStateMachine(sceneState.currentRole);
    const currentSceneConfig = stateMachine.scenes[sceneState.currentScene];
    const transition = currentSceneConfig?.on?.[event];

    if (!transition) {
      console.log(`[SCENE] No transition found for event: ${event}`);
      return;
    }

    console.log(`[SCENE] Found transition type: ${transition.type}`);

    // Turn completion (END) triggers callback to parent
    if (transition.type === "END") {
      console.log(`[SCENE] Triggering onTurnComplete callback`);
      onTurnComplete?.();
      return;
    }

    // Scene transitions go through reducer
    console.log(`[SCENE] Dispatching scene transition to: ${transition.target}`);
    dispatch({ type: "SCENE_TRANSITION", payload: { event } });
  };

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
    const stateMachine = getStateMachine(sceneState.currentRole);
    return sceneState.currentScene === stateMachine.initial;
  }, [sceneState.currentRole, sceneState.currentScene]);

  const contextValue: PlayerSceneContextValue = {
    currentRole: sceneState.currentRole,
    currentScene: sceneState.currentScene,
    requiresHandoff,
    triggerSceneTransition,
    completeHandoff,
    isInitialScene,
  };

  console.log(contextValue);

  return <PlayerSceneContext.Provider value={contextValue}>{children}</PlayerSceneContext.Provider>;
};

export const usePlayerScene = (): PlayerSceneContextValue => {
  const context = useContext(PlayerSceneContext);
  if (context === undefined) {
    throw new Error("usePlayerScene must be used within PlayerSceneProvider");
  }
  return context;
};
