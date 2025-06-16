import React, {
  useContext,
  createContext,
  ReactNode,
  useReducer,
  useCallback,
  useState,
} from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { uiConfig } from "@frontend/features/gameplay/state/ui-state-config";
import { conditions } from "@frontend/features/gameplay/state/ui-state-mappings";
import {
  useGiveClue,
  useMakeGuess,
  useCreateRound,
  useStartRound,
  useDealCards,
  useGameData,
} from "@frontend/game/api";
import { useQueryClient } from "@tanstack/react-query";

export const GameplayContext = createContext<GameplayContextProps | null>(null);

/**
 * GameplayContextProvider - handles UI state machine and API actions
 */
export const GameplayContextProvider = ({
  children,
  gameId,
}: GameplayProviderProps): JSX.Element => {
  // Get gameData inside the provider to avoid prop changes causing re-creation
  const { data: gameData } = useGameData(gameId);

  // Query client for data invalidation
  const queryClient = useQueryClient();

  // API mutation hooks
  const giveClue = useGiveClue(gameId);
  const makeGuess = useMakeGuess(gameId);
  const createRound = useCreateRound(gameId);
  const startRound = useStartRound(gameId);
  const dealCards = useDealCards(gameId);

  // Card animation state
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  // UI State machine for scene management - with fallback for loading state
  const [uiState, dispatch] = useReducer(
    (state: UIState, action: UIAction) =>
      uiReducer(state, action, gameData || ({} as GameData)),
    null,
    () => ({
      currentStage: gameData?.playerContext.role || PLAYER_ROLE.NONE,
      currentScene:
        uiConfig[gameData?.playerContext.role || PLAYER_ROLE.NONE]?.initial ||
        "main",
    }),
  );

  // Early return AFTER all hooks
  if (!gameData) {
    return <div>Loading game data...</div>;
  }

  const setUIStage = useCallback((stage: PlayerRole) => {
    dispatch({
      type: "SET_STAGE",
      payload: { stage },
    });
  }, []);

  /**
   * Trigger card animation for specific card
   */
  const triggerCardAnimation = useCallback((cardWord: string) => {
    setAnimatingCard(cardWord);
    // Clear after animation duration
    setTimeout(() => setAnimatingCard(null), 800);
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
            handleSceneTransition("CLUE_SUBMITTED");
          },
        },
      );
    },
    [giveClue, handleSceneTransition],
  );

  /**
   * Make a guess as codebreaker - optimistic updates handled in mutation
   */
  const handleMakeGuess = useCallback(
    (cardWord: string) => {
      const roundNumber = gameData.currentRound?.roundNumber;
      if (!roundNumber) return;

      makeGuess.mutate(
        { roundNumber, cardWord },
        {
          onSuccess: async () => {
            triggerCardAnimation(cardWord);

            // Refetch and wait for fresh gameData
            await queryClient.invalidateQueries({
              queryKey: ["gameData", gameId],
            });

            // Now conditions will evaluate with fresh server state
            handleSceneTransition("GUESS_MADE");
          },
        },
      );
    },
    [
      makeGuess,
      handleSceneTransition,
      triggerCardAnimation,
      gameData.currentRound?.roundNumber,
      gameId,
      queryClient,
    ],
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
        // Game Data
        gameData,

        // UI State Machine
        currentStage: uiState.currentStage,
        currentScene: uiState.currentScene,
        handleSceneTransition,
        setUIStage,

        // Card Animation
        animatingCard,
        triggerCardAnimation,

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
 * Custom hook to access the GameplayContext
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
const uiReducer = (
  state: UIState,
  action: UIAction,
  gameData: GameData,
): UIState => {
  switch (action.type) {
    case "TRIGGER_TRANSITION": {
      const currentStageConfig = uiConfig[state.currentStage];
      if (!currentStageConfig) return state;

      const currentSceneConfig = currentStageConfig.scenes[state.currentScene];
      const transitions = currentSceneConfig?.on?.[action.payload.event];

      // Handle conditional transitions (array of conditions)
      if (Array.isArray(transitions)) {
        const transition = transitions.find(
          (t) => !t.condition || conditions[t.condition]?.(gameData),
        );
        if (transition && currentStageConfig.scenes[transition.target]) {
          return {
            ...state,
            currentScene: transition.target,
          };
        }
      }

      // Handle simple transitions
      if (transitions && !Array.isArray(transitions)) {
        if (
          transitions.type === "scene" &&
          currentStageConfig.scenes[transitions.target]
        ) {
          return {
            ...state,
            currentScene: transitions.target,
          };
        }
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
  // Game Data
  gameData: GameData;

  // UI State Machine
  currentStage: PlayerRole;
  currentScene: string;
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;

  // Card Animation
  animatingCard: string | null;
  triggerCardAnimation: (cardWord: string) => void;

  // API Actions
  handleGiveClue: (
    roundNumber: number,
    word: string,
    targetCardCount: number,
  ) => void;
  handleMakeGuess: (cardWord: string) => void;
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
}
