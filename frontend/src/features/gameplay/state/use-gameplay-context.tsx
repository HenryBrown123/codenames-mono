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
  // ALL HOOKS MUST COME FIRST - BEFORE ANY CONDITIONS OR EARLY RETURNS

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

  const setUIStage = useCallback((stage: PlayerRole) => {
    dispatch({
      type: "SET_STAGE",
      payload: { stage },
    });
  }, []);

  const triggerCardAnimation = useCallback((cardWord: string) => {
    setAnimatingCard(cardWord);
    setTimeout(() => setAnimatingCard(null), 800);
  }, []);

  const handleSceneTransition = useCallback((event: string) => {
    dispatch({
      type: "TRIGGER_TRANSITION",
      payload: { event },
    });
  }, []);

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

  const handleMakeGuess = useCallback(
    (cardWord: string) => {
      const roundNumber = gameData?.currentRound?.roundNumber;
      if (!roundNumber) return;

      makeGuess.mutate(
        { roundNumber, cardWord },
        {
          onSuccess: async () => {
            triggerCardAnimation(cardWord);

            await queryClient.invalidateQueries({
              queryKey: ["gameData", gameId],
            });

            handleSceneTransition("GUESS_MADE");
          },
        },
      );
    },
    [
      makeGuess,
      handleSceneTransition,
      triggerCardAnimation,
      gameData?.currentRound?.roundNumber,
      gameId,
      queryClient,
    ],
  );

  const handleCreateRound = useCallback(() => {
    createRound.mutate();
  }, [createRound]);

  const handleStartRound = useCallback(
    (roundNumber: number) => {
      startRound.mutate({ roundNumber });
    },
    [startRound],
  );

  const handleDealCards = useCallback(
    (roundId: string) => {
      dealCards.mutate({ roundId });
    },
    [dealCards],
  );

  // NOW we can do early returns - all hooks have been called
  if (!gameData) {
    return <div>Loading game data...</div>;
  }

  return (
    <GameplayContext.Provider
      value={{
        gameData,
        currentStage: uiState.currentStage,
        currentScene: uiState.currentScene,
        handleSceneTransition,
        setUIStage,
        animatingCard,
        triggerCardAnimation,
        handleGiveClue,
        handleMakeGuess,
        handleCreateRound,
        handleStartRound,
        handleDealCards,
        isLoading: {
          giveClue: giveClue.isPending,
          makeGuess: makeGuess.isPending,
          createRound: createRound.isPending,
          startRound: startRound.isPending,
          dealCards: dealCards.isPending,
        },
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

export const useGameplayContext = (): GameplayContextProps => {
  const context = useContext(GameplayContext);
  if (!context) {
    throw new Error(
      "useGameplayContext must be used within a GameplayContextProvider",
    );
  }
  return context;
};

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

type UIAction =
  | { type: "TRIGGER_TRANSITION"; payload: { event: string } }
  | { type: "SET_STAGE"; payload: { stage: PlayerRole } };

interface UIState {
  currentStage: PlayerRole;
  currentScene: string;
}

interface GameplayContextProps {
  gameData: GameData;
  currentStage: PlayerRole;
  currentScene: string;
  handleSceneTransition: (event: string) => void;
  setUIStage: (stage: PlayerRole) => void;
  animatingCard: string | null;
  triggerCardAnimation: (cardWord: string) => void;
  handleGiveClue: (
    roundNumber: number,
    word: string,
    targetCardCount: number,
  ) => void;
  handleMakeGuess: (cardWord: string) => void;
  handleCreateRound: () => void;
  handleStartRound: (roundNumber: number) => void;
  handleDealCards: (roundId: string) => void;
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
