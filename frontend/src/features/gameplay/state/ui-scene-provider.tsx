import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useReducer,
} from "react";
import { useGameData } from "./game-data-provider";
import { useTurn } from "./active-turn-provider";
import { PLAYER_ROLE, GAME_TYPE, PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";
import { getStateMachine } from "./ui-state-config";
import { evaluateConditions } from "./ui-state-conditions";

interface UIState {
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
 * UI Reducer that receives fresh gameData and activeTurn on every action
 */
const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
  activeTurn: TurnData | null,
  currentRole: PlayerRole,
): UIState => {
  console.log("Calling uiReducer with, state:", state, "action:", action);
  console.log("gameData:", gameData);
  console.log("activeTurn:", activeTurn);
  console.log("currentRole:", currentRole);
  console.log("state.pendingTransition:", state.pendingTransition);

  switch (action.type) {
    case "TRIGGER_TRANSITION": {
      const event = action.payload.event;
      const stateMachine = getStateMachine(currentRole);
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
          currentRole,
          serverRole,
          gameData,
        );
        const targetStateMachine = getStateMachine(serverRole);

        if (needsHandoff) {
          return {
            ...state,
            showHandoff: true,
            pendingTransition: {
              stage: serverRole,
              scene: targetStateMachine.initial,
            },
          };
        } else {
          return {
            ...state,
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
        showHandoff: false,
        currentScene: state.pendingTransition.scene,
        pendingTransition: null,
      };
    }

    default:
      return state;
  }
};

/**
 * Creates initial UI state
 */
const createInitialUIState = (gameData: GameData): UIState => {
  const role = determineCorrectRole(gameData);
  const stateMachine = getStateMachine(role);

  return {
    currentScene: stateMachine.initial,
    showHandoff: false,
    pendingTransition: null,
  };
};

export const PlayerRoleSceneProvider: React.FC<
  PlayerRoleSceneProviderProps
> = ({ children }) => {
  const { gameData } = useGameData();
  const { activeTurn } = useTurn();

  // Current role is always derived from fresh gameData
  const currentRole = determineCorrectRole(gameData);

  // UI state managed by reducer - role transitions only happen via state machine "END"
  const [uiState, dispatch] = useReducer(
    (state: UIState, action: UIAction) =>
      uiReducer(state, action, gameData, activeTurn, currentRole),
    createInitialUIState(gameData),
  );

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
  }, []);

  const completeHandoff = useCallback(() => {
    dispatch({ type: "COMPLETE_ROLE_TRANSITION" });
  }, []);

  const contextValue: PlayerRoleSceneContextValue = {
    currentRole,
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
