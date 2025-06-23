import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface EndTurnVariables {
  roundNumber: number;
}

/**
 * Mutation for ending a turn
 * POST /games/{gameId}/rounds/{roundNumber}/end-turn
 */
export const useEndTurnMutation = (
  gameId: string,
): UseMutationResult<void, Error, EndTurnVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      const response: AxiosResponse = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/end-turn`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to end turn");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
