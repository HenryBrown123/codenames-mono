import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface StartRoundVariables {
  roundNumber: number;
}

/**
 * Mutation for starting a round
 * POST /games/{gameId}/rounds/{roundNumber}/start
 */
export const useStartRoundMutation = (
  gameId: string,
): UseMutationResult<void, Error, StartRoundVariables> => {
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
