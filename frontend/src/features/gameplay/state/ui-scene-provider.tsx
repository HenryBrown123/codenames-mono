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
  setCurrentRole: (role: PlayerRole) => void,
): UIState => {
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

        // Clear UI role to NONE when hitting END
        setCurrentRole(PLAYER_ROLE.NONE);

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
          // Direct transition - set role to server role immediately
          setCurrentRole(serverRole);
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
  const role =
    gameData.gameType === "SINGLE_DEVICE"
      ? PLAYER_ROLE.NONE
      : determineCorrectRole(gameData);
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

  // UI role state - only changes on handoff completion or END transitions
  const [currentRole, setCurrentRole] = useState<PlayerRole>(() => {
    // On fresh load, if game is in progress, start with NONE to force handoff
    const serverRole = determineCorrectRole(gameData);
    if (
      serverRole !== PLAYER_ROLE.NONE &&
      gameData.gameType === GAME_TYPE.SINGLE_DEVICE
    ) {
      return PLAYER_ROLE.NONE;
    }
    return serverRole;
  });

  // UI state managed by reducer - role transitions only happen via state machine "END"
  const [uiState, dispatch] = useReducer(
    (state: UIState, action: UIAction) =>
      uiReducer(
        state,
        action,
        gameData,
        activeTurn,
        currentRole,
        setCurrentRole,
      ),
    createInitialUIState(gameData),
  );

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
  }, []);

  const completeHandoff = useCallback(() => {
    if (!uiState.pendingTransition) {
      return;
    }

    // Set UI role to server role when handoff completes
    setCurrentRole(uiState.pendingTransition.stage);
    dispatch({ type: "COMPLETE_ROLE_TRANSITION" });
  }, [uiState.pendingTransition]);

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
