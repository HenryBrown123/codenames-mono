import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { MakeGuessRequest } from "@frontend/shared-types";

interface MakeGuessVariables extends MakeGuessRequest {
  roundNumber: number;
}

/**
 * Mutation for making a guess
 * POST /games/{gameId}/rounds/{roundNumber}/guesses
 */
export const useMakeGuessMutation = (
  gameId: string,
): UseMutationResult<void, Error, MakeGuessVariables> => {
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
