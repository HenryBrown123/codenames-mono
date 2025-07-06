import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { usePlayerContext } from "../../shared/providers/player-context-provider";

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
): UseMutationResult<void, Error, DealCardsInput> => {
  const queryClient = useQueryClient();
  const { currentPlayerId } = usePlayerContext();

  return useMutation({
    mutationFn: async ({ roundNumber, redeal = false }) => {

      const response: AxiosResponse<DealCardsApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/deal`,
        { redeal, playerId: currentPlayerId }
      );

      if (!response.data.success) {
        throw new Error("Failed to deal cards");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
