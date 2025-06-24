import React, {
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useReducer,
} from "react";
import { useGameData } from "../game-data";
import { useTurn } from "../turn-management";
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
  completeHandoff: () => void;
}

const PlayerRoleSceneContext = createContext<
  PlayerRoleSceneContextValue | undefined
>(undefined);

interface PlayerRoleSceneProviderProps {
  children: ReactNode;
}

/**
 * Determines the correct role based on actual game state
 */
const determineCorrectRole = (gameData: GameData): PlayerRole => {
  if (gameData.status !== "IN_PROGRESS") {
    return PLAYER_ROLE.NONE;
  }

  if (!gameData.currentRound) {
    return PLAYER_ROLE.NONE;
  }

  if (gameData.currentRound.status === "SETUP") {
    return PLAYER_ROLE.NONE;
  }

  if (gameData.currentRound.status === "COMPLETED") {
    return PLAYER_ROLE.NONE;
  }

  if (gameData.currentRound.status === "IN_PROGRESS") {
    const assignedRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;
    return assignedRole;
  }

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
  return (
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE &&
    currentRole !== newRole &&
    newRole !== PLAYER_ROLE.NONE &&
    newRole !== PLAYER_ROLE.SPECTATOR
  );
};

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
        const serverRole = determineCorrectRole(gameData);
        const needsHandoff = requiresDeviceHandoff(
          state.currentRole,
          serverRole,
          gameData,
        );
        const targetStateMachine = getStateMachine(serverRole);

        if (needsHandoff) {
          return {
            ...state,
            currentRole: PLAYER_ROLE.NONE,
            showHandoff: true,
            pendingTransition: {
              stage: serverRole,
              scene: targetStateMachine.initial,
            },
          };
        } else {
          return {
            ...state,
            currentRole: serverRole,
            currentScene: targetStateMachine.initial,
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

      return {
        ...state,
        currentRole: state.pendingTransition.stage,
        currentScene: state.pendingTransition.scene,
        showHandoff: false,
        pendingTransition: null,
      };
    }

    default:
      return state;
  }
};

/**
 * Creates initial UI state with handoff detection
 */
const createInitialUIState = (gameData: GameData): UIState => {
  const initialRole =
    gameData.gameType === GAME_TYPE.SINGLE_DEVICE
      ? PLAYER_ROLE.NONE
      : determineCorrectRole(gameData);

  const stateMachine = getStateMachine(initialRole);
  const serverRole = determineCorrectRole(gameData);
  const needsHandoff = requiresDeviceHandoff(initialRole, serverRole, gameData);

  if (needsHandoff) {
    const targetStateMachine = getStateMachine(serverRole);
    return {
      currentRole: initialRole,
      currentScene: stateMachine.initial,
      showHandoff: true,
      pendingTransition: {
        stage: serverRole,
        scene: targetStateMachine.initial,
      },
    };
  }

  return {
    currentRole: initialRole,
    currentScene: stateMachine.initial,
    showHandoff: false,
    pendingTransition: null,
  };
};

export const PlayerRoleSceneProvider: React.FC<
  PlayerRoleSceneProviderProps
> = ({ children }) => {
  const { gameData } = useGameData();
  const { activeTurn, clearActiveTurn } = useTurn();

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

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
  }, []);

  const completeHandoff = useCallback(() => {
    clearActiveTurn();
    dispatch({ type: "COMPLETE_ROLE_TRANSITION" });
  }, []);

  const contextValue: PlayerRoleSceneContextValue = {
    currentRole: uiState.currentRole,
    currentScene: uiState.currentScene,
    showHandoff: uiState.showHandoff,
    pendingTransition: uiState.pendingTransition,
    handleSceneTransition,
    completeHandoff,
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
