import React, {
  useContext,
  createContext,
  ReactNode,
  useCallback,
} from "react";
import { GameData } from "@frontend/shared-types";
import {
  useGiveClue,
  useMakeGuess,
  useCreateRound,
  useStartRound,
  useDealCards,
} from "@frontend/game/api";
import { useQueryClient } from "@tanstack/react-query";
import { useUIState } from "./use-ui-state";

/**
 * Generic mutation callbacks interface following React Query conventions
 */
interface MutationCallbacks<TData = unknown, TError = Error> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: () => void;
}

interface GameActionsContextProps {
  handleGiveClue: (
    roundNumber: number,
    word: string,
    targetCardCount: number,
    callbacks?: MutationCallbacks,
  ) => void;
  handleMakeGuess: (cardWord: string, callbacks?: MutationCallbacks) => void;
  handleCreateRound: (callbacks?: MutationCallbacks) => void;
  handleStartRound: (
    roundNumber: number,
    callbacks?: MutationCallbacks,
  ) => void;
  handleDealCards: (roundId: string, callbacks?: MutationCallbacks) => void;
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

interface GameActionsProviderProps {
  children: ReactNode;
  gameId: string;
  gameData: GameData;
}

const GameActionsContext = createContext<GameActionsContextProps | null>(null);

/**
 * Game Actions Provider - handles all game mutation actions with callback support
 */
export const GameActionsProvider = ({
  children,
  gameId,
  gameData,
}: GameActionsProviderProps): JSX.Element => {
  const { handleSceneTransition } = useUIState();
  const queryClient = useQueryClient();

  // API mutation hooks
  const giveClue = useGiveClue(gameId);
  const makeGuess = useMakeGuess(gameId);
  const createRound = useCreateRound(gameId);
  const startRound = useStartRound(gameId);
  const dealCards = useDealCards(gameId);

  const handleGiveClue = useCallback(
    (
      roundNumber: number,
      word: string,
      targetCardCount: number,
      callbacks?: MutationCallbacks,
    ) => {
      giveClue.mutate(
        { roundNumber, word, targetCardCount },
        {
          onSuccess: (data) => {
            handleSceneTransition("CLUE_SUBMITTED");
            callbacks?.onSuccess?.(data);
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
          onSettled: () => {
            callbacks?.onSettled?.();
          },
        },
      );
    },
    [giveClue, handleSceneTransition],
  );

  const handleMakeGuess = useCallback(
    (cardWord: string, callbacks?: MutationCallbacks) => {
      const roundNumber = gameData?.currentRound?.roundNumber;
      if (!roundNumber) return;

      makeGuess.mutate(
        { roundNumber, cardWord },
        {
          onSuccess: async (data) => {
            await queryClient.invalidateQueries({
              queryKey: ["gameData", gameId],
            });
            handleSceneTransition("GUESS_MADE");
            callbacks?.onSuccess?.(data);
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
          onSettled: () => {
            callbacks?.onSettled?.();
          },
        },
      );
    },
    [
      makeGuess,
      handleSceneTransition,
      gameData?.currentRound?.roundNumber,
      gameId,
      queryClient,
    ],
  );

  const handleCreateRound = useCallback(
    (callbacks?: MutationCallbacks) => {
      createRound.mutate(undefined, {
        onSuccess: (data) => {
          callbacks?.onSuccess?.(data);
        },
        onError: (error) => {
          callbacks?.onError?.(error);
        },
        onSettled: () => {
          callbacks?.onSettled?.();
        },
      });
    },
    [createRound],
  );

  const handleStartRound = useCallback(
    (roundNumber: number, callbacks?: MutationCallbacks) => {
      startRound.mutate(
        { roundNumber },
        {
          onSuccess: (data) => {
            callbacks?.onSuccess?.(data);
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
          onSettled: () => {
            callbacks?.onSettled?.();
          },
        },
      );
    },
    [startRound],
  );

  const handleDealCards = useCallback(
    (roundId: string, callbacks?: MutationCallbacks) => {
      dealCards.mutate(
        { roundId },
        {
          onSuccess: (data) => {
            callbacks?.onSuccess?.(data);
          },
          onError: (error) => {
            callbacks?.onError?.(error);
          },
          onSettled: () => {
            callbacks?.onSettled?.();
          },
        },
      );
    },
    [dealCards],
  );

  return (
    <GameActionsContext.Provider
      value={{
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
    </GameActionsContext.Provider>
  );
};

/**
 * Hook to access game actions context
 */
export const useGameActions = (): GameActionsContextProps => {
  const context = useContext(GameActionsContext);
  if (!context) {
    throw new Error("useGameActions must be used within a GameActionsProvider");
  }
  return context;
};
