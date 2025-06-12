import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
} from "react";
import { Stage, GameState } from "@frontend/shared-types/game-types";
import { uiConfig } from "@frontend/game/state/game-state-config";
import { useProcessTurn } from "@frontend/game/api";

// Create a context to share gamesplay state and event handlers
export const GameplayContext = createContext<GameplayContextProps | null>(null);

/**
 * GameplayContextProvider component.
 * Manages gameplay UI state and transitions using a reducer.
 * Synchronizes the UI stage with the backend game stage.
 *
 * @param {GameplayProviderProps} props - Props including children components and the current backend game stage.
 * @returns {JSX.Element} - The provider wrapping children components with the context value.
 */
export const GameplayContextProvider = ({
  children,
  currentGameStage,
}: GameplayProviderProps): JSX.Element => {
  // State reducer for managing UI stage and scene
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    uiStage: currentGameStage,
    currentScene: uiConfig[currentGameStage]?.initial || "",
  });

  /**
   * Handles backend turn submission.
   * Dispatches a "TRIGGER_TRANSITION" event upon successful turn processing.
   */
  const { mutate: processTurn } = useProcessTurn({
    onSuccess: () => {
      dispatch({
        type: "TRIGGER_TRANSITION",
        payload: { event: "next" },
      });
    },
  });

  /**
   * Submits a turn to the backend and triggers UI transitions if successful.
   *
   * @param {string} gameId - The unique identifier for the game.
   * @param {GameState} updatedGameState - The updated game state to submit.
   */
  const handleTurnSubmission = useCallback(
    (gameId: string, updatedGameState: GameState) => {
      processTurn({ gameId, gameState: updatedGameState });
    },
    [processTurn],
  );

  /**
   * Handles gameplay events to transition UI state based on `uiConfig`.
   * Ensures the UI stage is synchronized with the backend game stage.
   *
   * @param {string} event - The event name triggering the transition (e.g., "next").
   */
  const handleGameplayEvent = useCallback(
    (event: string) => {
      const { uiStage, currentScene } = state;
      const stageConfig = uiConfig[uiStage];
      const sceneConfig = stageConfig.scenes[currentScene];

      const transition = sceneConfig.on?.[event];

      if (transition?.type === "scene") {
        if (stageConfig.scenes[transition.target]) {
          dispatch({ type: "TRIGGER_TRANSITION", payload: { event } });
        } else {
          console.warn(`No valid scene '${transition.target}' found.`);
        }
      } else if (currentGameStage !== uiStage) {
        dispatch({ type: "SET_STAGE", payload: { stage: currentGameStage } });
      } else {
        console.warn(`No transition or stage difference for event '${event}'.`);
      }
    },
    [state, currentGameStage],
  );

  return (
    <GameplayContext.Provider
      value={{
        uiStage: state.uiStage,
        currentScene: state.currentScene,
        dispatch,
        handleGameplayEvent,
        handleTurnSubmission,
      }}
    >
      {children}
    </GameplayContext.Provider>
  );
};

/**
 * Custom hook to access the GameplayContext.
 * Ensures the hook is used within a GameplayContextProvider.
 *
 * @returns {GameplayContextProps} - Context value containing UI state and event handlers.
 * @throws {Error} - If the hook is used outside of a GameplayContextProvider.
 */
export const useGameplayContext = (): GameplayContextProps => {
  const context = useContext(GameplayContext);
  if (!context) {
    throw new Error(
      "useGameplayContext must be used within a GameplayProvider",
    );
  }
  return context;
};

// Reducer for managing gameplay state transitions
const gameReducer = (
  state: GameplayScene,
  action: GameplayAction,
): GameplayScene => {
  const currentStageConfig = uiConfig[state.uiStage];
  const currentSceneConfig = currentStageConfig.scenes[state.currentScene];

  switch (action.type) {
    case "TRIGGER_TRANSITION": {
      const transition = currentSceneConfig.on?.[action.payload.event];
      if (
        transition?.type === "scene" &&
        currentStageConfig.scenes[transition.target]
      ) {
        return {
          ...state,
          currentScene: transition.target,
        };
      }
      console.warn(
        `No valid scene transition for event '${action.payload.event}'`,
      );

      return {
        ...state,
        currentScene: transition.target,
      };
    }
    case "SET_STAGE": {
      const newStage = action.payload.stage;
      if (uiConfig[newStage]) {
        return {
          uiStage: newStage,
          currentScene: uiConfig[newStage].initial || "",
        };
      }
      console.error(`Invalid stage '${newStage}' received from backend.`);
      return state;
    }
    default:
      return state;
  }
};

// Initial state for the gameplay reducer
const initialState: GameplayScene = {
  uiStage: null,
  currentScene: "",
};

// Types
type GameplayAction =
  | {
      type: "TRIGGER_TRANSITION";
      payload: { event: string };
    }
  | {
      type: "SET_STAGE";
      payload: { stage: Stage };
    };

interface GameplayScene {
  uiStage: Stage;
  currentScene: string;
}

interface GameplayContextProps {
  dispatch: React.Dispatch<GameplayAction>;
  uiStage: Stage;
  currentScene: string;
  handleGameplayEvent(event: string): void;
  handleTurnSubmission(gameId: string, updatedGameState: GameState): void;
}

interface GameplayProviderProps {
  children: ReactNode;
  currentGameStage: Stage;
}
