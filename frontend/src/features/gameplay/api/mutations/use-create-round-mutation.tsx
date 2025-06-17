import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

/**
 * Mutation for creating a new round
 * POST /games/{gameId}/rounds
 */
export const useCreateRoundMutation = (
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
