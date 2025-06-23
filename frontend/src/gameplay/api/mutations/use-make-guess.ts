import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { TurnData } from "../queries/use-turn-query";
import { MakeGuessRequest } from "@frontend/shared-types";

interface MakeGuessVariables extends MakeGuessRequest {
  roundNumber: number;
}

/**
 * Response type that includes turn data
 * This should match your backend API response
 */
interface MakeGuessResponse {
  success: true;
  data: {
    guess: {
      cardWord: string;
      outcome: string;
      createdAt: Date;
    };
    turn: TurnData; // Full turn object with updated state
  };
}

/**
 * Mutation for making a guess
 * POST /games/{gameId}/rounds/{roundNumber}/guesses
 *
 * Updated to return turn data for cache integration
 */
export const useMakeGuessMutation = (
  gameId: string,
): UseMutationResult<MakeGuessResponse, Error, MakeGuessVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber, cardWord }) => {
      const response: AxiosResponse<MakeGuessResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/guesses`,
        { cardWord },
      );

      if (!response.data.success) {
        throw new Error("Failed to make guess");
      }

      return response.data;
    },
    onSuccess: async (data) => {
      const turnData = data.data.turn;
      console.log("Returned turn data: ", turnData);
      // Direct cache update for turn data - no await needed, synchronous operation
      queryClient.setQueryData(["turn", turnData.id], turnData);
      // Invalidate game data to refetch game state
      await queryClient.refetchQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
