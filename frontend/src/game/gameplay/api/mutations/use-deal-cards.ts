import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { useGameDataRequired } from "../../providers";

interface DealCardsApiResponse {
  success: boolean;
  data: {
    cards: Array<{
      word: string;
      teamName: string | null;
      cardType: string;
      selected: boolean;
    }>;
  };
}

interface DealCardsInput {
  roundNumber: number;
  redeal?: boolean;
}

/**
 * Mutation that deals (or redeals) the cards for a round.
 *
 * Sends the viewer's `publicId` for permission checks. On success
 * invalidates both the game-data and game-events queries so the new
 * card layout and `deal` event surface without waiting for a poll.
 */
export const useDealCardsMutation = (
  gameId: string,
): UseMutationResult<DealCardsApiResponse["data"], Error, DealCardsInput> => {
  const queryClient = useQueryClient();
  const { gameData } = useGameDataRequired();

  return useMutation({
    mutationFn: async ({ roundNumber, redeal = false }) => {
      const response: AxiosResponse<DealCardsApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/deal`,
        { redeal, playerId: gameData.playerContext?.publicId ?? null },
      );

      if (!response.data.success) {
        throw new Error("Failed to deal cards");
      }

      return response.data.data;
    },
    onSuccess: async () => {
      console.log("[Mutation Hook] Starting invalidation");
      console.log("[Mutation Hook] Query key:", ["gameData", gameId]);

      await queryClient.invalidateQueries({
        queryKey: ["gameData", gameId],
      });

      queryClient.invalidateQueries({ queryKey: ["game-events", gameId] });

      console.log("[Mutation Hook] Invalidation complete");
    },
  });
};
