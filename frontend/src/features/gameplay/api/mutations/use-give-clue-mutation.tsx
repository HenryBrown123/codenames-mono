import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GiveClueRequest } from "@frontend/shared-types";

interface GiveClueVariables extends GiveClueRequest {
  roundNumber: number;
}

/**
 * Mutation for giving a clue
 * POST /games/{gameId}/rounds/{roundNumber}/clues
 */
export const useGiveClueMutation = (
  gameId: string,
): UseMutationResult<void, Error, GiveClueVariables> => {
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
