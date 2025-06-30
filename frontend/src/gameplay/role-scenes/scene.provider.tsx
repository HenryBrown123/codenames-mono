import React, {
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useReducer,
} from "react";
import { useGameData } from "../game-data";
import { useTurn } from "../turn-management";
import { usePlayerContext } from "../player-context/player-context.provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData, TurnData } from "@frontend/shared-types";
import { getStateMachine } from "./scene-config";
import { evaluateConditions } from "./scene-conditions";

interface UIState {
  currentRole: PlayerRole;
  currentScene: string;
  showHandoff: boolean;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  } | null;
}

type UIAction =
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
  handleSceneTransition: (event: string) => void;
  completeHandoff: (playerId: string) => void;
  isInitialScene: boolean;
}

const PlayerRoleSceneContext = createContext<
  PlayerRoleSceneContextValue | undefined
>(undefined);

interface PlayerRoleSceneProviderProps {
  children: ReactNode;
}

/**
 * Finds matching transition based on conditions
 */
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

/**
 * Pure UI Reducer with no side effects
 */
const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
  activeTurn: TurnData | null,
): UIState => {
  switch (action.type) {
    case "TRIGGER_TRANSITION": {
      const event = action.payload.event;
      const stateMachine = getStateMachine(state.currentRole);
      const currentSceneConfig = stateMachine.scenes[state.currentScene];

      if (!currentSceneConfig?.on?.[event]) {
        return state;
      }

      const transitions = currentSceneConfig.on[event];
      const matchingTransition = findMatchingTransition(
        transitions,
        gameData,
        activeTurn,
      );

      if (!matchingTransition) {
        return state;
      }

      if (matchingTransition.type === "END") {
        // In single device mode, always show handoff when ending a role
        if (gameData.gameType === GAME_TYPE.SINGLE_DEVICE) {
          return {
            ...state,
            showHandoff: true,
            pendingTransition: {
              // We don't know the next role yet - handoff will figure it out
              stage: PLAYER_ROLE.NONE,
              scene: 'main',
            },
          };
        } else {
          // Multi-device mode - role stays the same, just reset to initial scene
          const stateMachine = getStateMachine(state.currentRole);
          return {
            ...state,
            currentScene: stateMachine.initial,
            showHandoff: false,
            pendingTransition: null,
          };
        }
      }

      if (matchingTransition.type === "scene" && matchingTransition.target) {
        return {
          ...state,
          currentScene: matchingTransition.target,
        };
      }

      return state;
    }

    case "COMPLETE_ROLE_TRANSITION": {
      if (!state.pendingTransition) {
        return state;
      }

      // Get the actual role from game data after player change
      const newRole = gameData.playerContext?.role || PLAYER_ROLE.NONE;
      const targetStateMachine = getStateMachine(newRole);

      return {
        ...state,
        currentRole: newRole,
        currentScene: targetStateMachine.initial,
        showHandoff: false,
        pendingTransition: null,
      };
    }

    default:
      return state;
  }
};

/**
 * Creates initial UI state - always start with NONE for single device
 */
const createInitialUIState = (gameData: GameData): UIState => {
  const stateMachine = getStateMachine(PLAYER_ROLE.NONE);
  
  // Check if game needs player on mount (handles refresh case)
  const needsHandoff = 
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    gameData.currentRound?.status === 'IN_PROGRESS';
  
  return {
    currentRole: PLAYER_ROLE.NONE,
    currentScene: stateMachine.initial,
    showHandoff: needsHandoff,
    pendingTransition: needsHandoff ? {
      stage: PLAYER_ROLE.NONE, // Handoff will determine actual role
      scene: 'main',
    } : null,
  };
};

export const PlayerRoleSceneProvider: React.FC<
  PlayerRoleSceneProviderProps
> = ({ children }) => {
  const { gameData } = useGameData();
  const { activeTurn, clearActiveTurn } = useTurn();
  const { setCurrentPlayerId } = usePlayerContext();

  const reducerWithDependencies = useCallback(
    (state: UIState, action: UIAction) =>
      uiReducer(state, action, gameData, activeTurn),
    [gameData, activeTurn],
  );

  const [uiState, dispatch] = useReducer(
    reducerWithDependencies,
    gameData,
    createInitialUIState,
  );

  // Determine if current scene is the initial scene for the role
  const isInitialScene = React.useMemo(() => {
    const stateMachine = getStateMachine(uiState.currentRole);
    return uiState.currentScene === stateMachine.initial;
  }, [uiState.currentRole, uiState.currentScene]);

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
  }, []);

  const completeHandoff = useCallback((newPlayerId: string) => {
    // Set the player ID - this will trigger game data refetch
    setCurrentPlayerId(newPlayerId);
    
    // Clear any active turn context
    clearActiveTurn();
    
    // Complete the UI transition
    dispatch({ type: "COMPLETE_ROLE_TRANSITION" });
  }, [setCurrentPlayerId, clearActiveTurn]);

  const contextValue: PlayerRoleSceneContextValue = {
    currentRole: uiState.currentRole,
    currentScene: uiState.currentScene,
    showHandoff: uiState.showHandoff,
    pendingTransition: uiState.pendingTransition,
    handleSceneTransition,
    completeHandoff,
    isInitialScene,
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