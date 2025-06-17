import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface DealCardsVariables {
  roundId: string;
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
