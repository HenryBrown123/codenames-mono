import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface DealCardsVariables {
  roundNumber: number;
}

/**
 * Mutation for dealing cards to a round
 * POST /games/{gameId}/rounds/{id}/deal
 */
export const useDealCardsMutation = (
  gameId: string,
): UseMutationResult<void, Error, DealCardsVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/deal`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to deal cards");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
