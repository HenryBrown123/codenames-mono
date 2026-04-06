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
 * Deals cards for a round.
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

      /** Invalidate events query to fetch new deal event */
      queryClient.invalidateQueries({ queryKey: ["game-events", gameId] });

      console.log("[Mutation Hook] Invalidation complete");
    },
  });
};
