import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
} from "react";
import { PlayerRole } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { uiConfig } from "@frontend/game/state/game-state-config";
import {
  useGiveClue,
  useMakeGuess,
  useCreateRound,
  useStartRound,
  useDealCards,
} from "@frontend/game/api";

// Create a context to share gameplay state and event handlers
export const GameplayContext = createContext<GameplayContextProps | null>(null);

/**
 * Hybrid GameplayContextProvider.
 * Combines UI state machine for presentation flow with specific API actions.
 */
export const GameplayContextProvider = ({
  children,
  gameId,
  gameData,
}: GameplayProviderProps): JSX.Element => {
  // UI State machine for scene management
  const [uiState, dispatch] = useReducer(uiReducer, {
    currentStage: gameData.playerContext.role,
    currentScene: uiConfig[gameData.playerContext.role]?.initial || "main",
  });

  // API mutation hooks
  const giveClue = useGiveClue(gameId);
  const makeGuess = useMakeGuess(gameId);
  const createRound = useCreateRound(gameId);
  const startRound = useStartRound(gameId);
  const dealCards = useDealCards(gameId);

  // Simple manual stage setting when needed
  const setUIStage = useCallback((stage: PlayerRole) => {
    dispatch({
      type: "SET_STAGE",
      payload: { stage },
    });
  }, []);

  /**
   * Handle UI scene transitions
   */
  const handleSceneTransition = useCallback((event: string) => {
    dispatch({
      type: "TRIGGER_TRANSITION",
      payload: { event },
    });
  }, []);

  /**
   * Give a clue as codemaster
   */
  const handleGiveClue = useCallback(
    (roundNumber: number, word: string, targetCardCount: number) => {
      giveClue.mutate(
        { roundNumber, word, targetCardCount },
        {
          onSuccess: () => {
            // Trigger UI transition to waiting state
            handleSceneTransition("CLUE_SUBMITTED");
          },
        },
      );
    },
    [giveClue, handleSceneTransition],
  );

  /**
   * Make a guess as codebreaker
   */
  const handleMakeGuess = useCallback(
    (roundNumber: number, cardWord: string) => {
      makeGuess.mutate(
        { roundNumber, cardWord },
        {
          onSuccess: () => {
            // Trigger UI transition to outcome scene
            handleSceneTransition("GUESS_MADE");
          },
        },
      );
    },
    [makeGuess, handleSceneTransition],
  );

  /**
   * Create a new round
   */
  const handleCreateRound = useCallback(() => {
    createRound.mutate();
  }, [createRound]);

  /**
   * Start a round
   */
  const handleStartRound = useCallback(
    (roundNumber: number) => {
      startRound.mutate({ roundNumber });
    },
    [startRound],
  );

  /**
   * Deal cards to a round
   */
  const handleDealCards = useCallback(
    (roundId: string) => {
      dealCards.mutate({ roundId });
    },
    [dealCards],
  );

  return (
    <GameplayContext.Provider
      value={{
        // UI State Machine
        currentStage: uiState.currentStage,
        currentScene: uiState.currentScene,
        handleSceneTransition,
        setUIStage,

        // API Actions
        handleGiveClue,
        handleMakeGuess,
        handleCreateRound,
        handleStartRound,
        handleDealCards,

        // Loading States
        isLoading: {
          giveClue: giveClue.isPending,
          makeGuess: makeGuess.isPending,
          createRound: createRound.isPending,
          startRound: startRound.isPending,
          dealCards: dealCards.isPending,
        },

        // Errors
        errors: {
          giveClue: giveClue.error,
          makeGuess: makeGuess.error,
          createRound: createRound.error,
          startRound: startRound.error,
          dealCards: dealCards.error,
        },
      }}
    >
      {children}
    </GameplayContext.Provider>
  );
};

/**
 * Custom hook to access the GameplayContext.
 */
export const useGameplayContext = (): GameplayContextProps => {
  const context = useContext(GameplayContext);
  if (!context) {
    throw new Error(
      "useGameplayContext must be used within a GameplayContextProvider",
    );
  }
  return context;
};

// UI State Reducer
const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "TRIGGER_TRANSITION": {
      const currentStageConfig = uiConfig[state.currentStage];
      if (!currentStageConfig) return state;

      const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
      const transition = currentSceneConfig?.on?.[action.payload.event];

      if (
        transition?.type === "scene" &&
        currentStageConfig.scenes[transition.target]
      ) {
        return {
          ...state,
          currentScene: transition.target,
        };
      }
      return state;
    }
    case "SET_STAGE": {
      const newStage = action.payload.stage;
      if (uiConfig[newStage]) {
        return {
          currentStage: newStage,
          currentScene: uiConfig[newStage].initial || "main",
        };
      }
      return state;
    }
    default:
      return state;
  }
};

// Types
type UIAction =
  | { type: "TRIGGER_TRANSITION"; payload: { event: string } }
  | { type: "SET_STAGE"; payload: { stage: PlayerRole } };

interface UIState {
  currentStage: PlayerRole;
  currentScene: string;
}

interface GameplayContextProps {
  // UI State Machine
  currentStage: PlayerRole;
  currentScene: string;
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;

  // API Actions
  handleGiveClue: (
    roundNumber: number,
    word: string,
    targetCardCount: number,
  ) => void;
  handleMakeGuess: (roundNumber: number, cardWord: string) => void;
  handleCreateRound: () => void;
  handleStartRound: (roundNumber: number) => void;
  handleDealCards: (roundId: string) => void;

  // States
  isLoading: {
    giveClue: boolean;
    makeGuess: boolean;
    createRound: boolean;
    startRound: boolean;
    dealCards: boolean;
  };
  errors: {
    giveClue: Error | null;
    makeGuess: Error | null;
    createRound: Error | null;
    startRound: Error | null;
    dealCards: Error | null;
  };
}

interface GameplayProviderProps {
  children: ReactNode;
  gameId: string;
  gameData: GameData;
}
