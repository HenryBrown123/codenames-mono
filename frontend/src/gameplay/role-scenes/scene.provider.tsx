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

import React, { useCallback, createContext, useContext, ReactNode, useReducer } from "react";
import { useGameDataRequired } from "../game-data/game-data.provider";
import { useTurn } from "../turn-management";
import { usePlayerContext } from "../player-context/player-context.provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData, TurnData } from "@frontend/shared-types";
import { getStateMachine } from "./scene-config";
import { evaluateConditions } from "./scene-conditions";

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
 * Finds the applicable transition based on game state conditions
 */
const findApplicableTransition = (
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

        const allConditionsMet = conditionsArray.every((conditionKey: string) =>
          evaluateConditions(conditionKey, gameData, activeTurn),
        );

        if (allConditionsMet) {
          return transition;
        }
      } else if (!transition.condition) {
        return transition;
      }
    }
    return null;
  } else {
    if (transitions.condition && gameData) {
      const conditionMet = evaluateConditions(transitions.condition, gameData, activeTurn);
      return conditionMet ? transitions : null;
    }
    return transitions;
  }
};

/**
 * Scene reducer - manages transitions within a player's turn
 * Pure function that only handles scene-to-scene transitions
 */
const sceneReducer = (
  state: PlayerSceneState,
  action: SceneAction,
  gameData: GameData,
  activeTurn: TurnData | null,
): PlayerSceneState => {
  switch (action.type) {
    case "SCENE_TRANSITION": {
      const event = action.payload.event;
      const stateMachine = getStateMachine(state.currentRole);
      const currentSceneConfig = stateMachine.scenes[state.currentScene];

      if (!currentSceneConfig?.on?.[event]) {
        return state;
      }

      const transitions = currentSceneConfig.on[event];
      const applicableTransition = findApplicableTransition(transitions, gameData, activeTurn);

      if (!applicableTransition) {
        return state;
      }

      // Scene transitions update the current scene
      // END transitions are handled by triggerSceneTransition
      if (applicableTransition.type === "scene" && applicableTransition.target) {
        return {
          ...state,
          currentScene: applicableTransition.target,
        };
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
  const { activeTurn } = useTurn();
  const { setCurrentPlayerId } = usePlayerContext();

  const reducerWithDependencies = useCallback(
    (state: PlayerSceneState, action: SceneAction) =>
      sceneReducer(state, action, gameData, activeTurn),
    [gameData, activeTurn],
  );

  const [sceneState, dispatch] = useReducer(
    reducerWithDependencies,
    gameData,
    determineInitialSceneState,
  );

  // Derive current state from game data to stay in sync
  const currentState = React.useMemo(() => {
    const derivedState = determineInitialSceneState(gameData);

    // If the player role changed (e.g., after handoff), use the new derived state
    if (sceneState.currentRole !== derivedState.currentRole) {
      return derivedState;
    }

    // Otherwise, keep current scene but update handoff status
    return {
      ...sceneState,
      requiresHandoff: derivedState.requiresHandoff,
    };
  }, [gameData, sceneState]);

  /**
   * Triggers scene transitions and handles turn completion
   * END transitions invoke the onTurnComplete callback
   */
  const triggerSceneTransition = useCallback(
    (event: string) => {
      console.log(
        `[SCENE] triggerSceneTransition: ${event}, role: ${currentState.currentRole}, scene: ${currentState.currentScene}`,
      );

      const stateMachine = getStateMachine(currentState.currentRole);
      const currentSceneConfig = stateMachine.scenes[currentState.currentScene];
      const transitions = currentSceneConfig?.on?.[event];

      if (!transitions) {
        console.log(`[SCENE] No transitions found for event: ${event}`);
        return;
      }

      const applicableTransition = findApplicableTransition(transitions, gameData, activeTurn);

      if (!applicableTransition) {
        console.log(`[SCENE] No applicable transition found for event: ${event}`);
        return;
      }

      console.log(`[SCENE] Found transition type: ${applicableTransition.type}`);

      // Turn completion (END) triggers callback to parent
      if (applicableTransition.type === "END") {
        console.log(`[SCENE] Triggering onTurnComplete callback`);
        onTurnComplete?.();
        return;
      }

      // Scene transitions go through reducer
      console.log(`[SCENE] Dispatching scene transition to: ${applicableTransition.target}`);
      dispatch({ type: "SCENE_TRANSITION", payload: { event } });
    },
    [currentState, gameData, activeTurn, onTurnComplete],
  );

  /**
   * Completes device handoff by setting the new active player
   * This cascades through React Query to reset the scene state
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

  const contextValue: PlayerSceneContextValue = gameData
    ? {
        currentRole: currentState.currentRole,
        currentScene: currentState.currentScene,
        requiresHandoff: currentState.requiresHandoff,
        triggerSceneTransition,
        completeHandoff,
        isInitialScene,
      }
    : {
        currentRole: PLAYER_ROLE.NONE,
        currentScene: "lobby",
        requiresHandoff: false,
        triggerSceneTransition: () => {},
        completeHandoff: () => {},
        isInitialScene: true,
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
