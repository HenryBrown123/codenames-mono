import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GiveClueRequest } from "@frontend/shared-types";
import { TurnData } from "../queries/use-turn-query";

interface GiveClueVariables extends GiveClueRequest {
  roundNumber: number;
}

/**
 * Response type that includes turn data
 * This should match your backend API response
 */
interface GiveClueResponse {
  success: true;
  data: {
    clue: {
      word: string;
      number: number;
      createdAt: Date;
    };
    turn: TurnData; // Full turn object with updated state
  };
}

/**
 * Mutation for giving a clue
 * POST /games/{gameId}/rounds/{roundNumber}/clues
 *
 * Updated to return turn data for cache integration
 */
export const useGiveClueMutation = (
  gameId: string,
): UseMutationResult<GiveClueResponse, Error, GiveClueVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundNumber, word, targetCardCount }) => {
      const response: AxiosResponse<GiveClueResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/clues`,
        { word, targetCardCount },
      );

      if (!response.data.success) {
        throw new Error("Failed to give clue");
      }

      return response.data;
    },
    onSuccess: async (data) => {
      const turnData = data.data.turn;

      // Direct cache update for turn data - no await needed, synchronous operation
      queryClient.setQueryData(["turn", turnData.id], turnData);

      // Invalidate game data to refetch game state
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
    },
  });
};
