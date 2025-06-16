import {
  useQuery,
  UseQueryResult,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import {
  GameData,
  GiveClueRequest,
  MakeGuessRequest,
  Card,
} from "@frontend/shared-types";
import fetchGame from "./fetch-game";

/**
 * Hook for fetching game data
 */
export const useGameData = (
  gameId: string | null,
): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["gameData", gameId],
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      return fetchGame(gameId);
    },
    enabled: !!gameId,
  });
};

/**
 * Hook for giving a clue
 * POST /games/{gameId}/rounds/{roundNumber}/clues
 */
export const useGiveClue = (
  gameId: string,
): UseMutationResult<
  void,
  Error,
  { roundNumber: number } & GiveClueRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber, word, targetCardCount }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/clues`,
        { word, targetCardCount },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to give clue");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
/**
 * Hook for making a guess with optimistic updates
 * POST /games/{gameId}/rounds/{roundNumber}/guesses
 */
/**
 * Hook for making a guess with optimistic updates
 * POST /games/{gameId}/rounds/{roundNumber}/guesses
 */
export const useMakeGuess = (
  gameId: string,
): UseMutationResult<
  void,
  Error,
  { roundNumber: number } & MakeGuessRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber, cardWord }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/guesses`,
        { cardWord },
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to make guess");
      }
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["gameData", gameId] });

      // Snapshot the previous value
      const previousGameData = queryClient.getQueryData<GameData>([
        "gameData",
        gameId,
      ]);

      // Optimistically update the card as selected
      queryClient.setQueryData<GameData>(["gameData", gameId], (old) => {
        if (!old?.currentRound?.cards) return old;

        // Find the card that needs to be updated
        const cardIndex = old.currentRound.cards.findIndex(
          (card: Card) => card.word === variables.cardWord,
        );

        if (cardIndex === -1) return old; // Card not found, no update needed

        const targetCard = old.currentRound.cards[cardIndex];

        // If card is already selected, no update needed
        if (targetCard.selected) return old;

        // Create new cards array with only the target card replaced
        const newCards = [...old.currentRound.cards];
        newCards[cardIndex] = { ...targetCard, selected: true };

        return {
          ...old,
          currentRound: {
            ...old.currentRound,
            cards: newCards,
          },
        };
      });

      // Return context for potential rollback
      return { previousGameData };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousGameData) {
        queryClient.setQueryData(
          ["gameData", gameId],
          context.previousGameData,
        );
      }
    },
    onSuccess: () => {
      // Refetch to get the authoritative server state
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};

/**
 * Hook for creating a new round
 * POST /games/{gameId}/rounds
 */
export const useCreateRound = (
  gameId: string,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response: AxiosResponse = await api.post(`/games/${gameId}/rounds`);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create round");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};

/**
 * Hook for starting a round
 * POST /games/{gameId}/rounds/{roundNumber}/start
 */
export const useStartRound = (
  gameId: string,
): UseMutationResult<void, Error, { roundNumber: number }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/start`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to start round");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};

/**
 * Hook for dealing cards to a round
 * POST /games/{gameId}/rounds/{id}/deal
 */
export const useDealCards = (
  gameId: string,
): UseMutationResult<void, Error, { roundId: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundId }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundId}/deal`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to deal cards");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
