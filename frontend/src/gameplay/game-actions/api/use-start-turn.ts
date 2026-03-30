import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/api";
import { usePlayerContext } from "../../game-data/providers/player-context-provider";

interface StartTurnApiResponse {
  success: boolean;
  data: {
    turn: {
      publicId: string;
      teamName: string;
      status: string;
      createdAt: string;
    };
  };
}

interface StartTurnInput {
  roundNumber: number;
  /** Override the player ID — used when currentPlayerId isn't set (e.g. auto-advancing after an AI turn). */
  playerId?: string;
}

/**
 * Creates a new turn for the next team.
 * Used when the previous turn has completed and a new turn needs to be started manually.
 */
export const useStartTurnMutation = (
  gameId: string,
): UseMutationResult<void, Error, StartTurnInput> => {
  const queryClient = useQueryClient();
  const { currentPlayerId } = usePlayerContext();

  return useMutation({
    mutationFn: async ({ roundNumber, playerId: playerIdOverride }) => {
      const id = playerIdOverride ?? currentPlayerId;
      if (!id) {
        throw new Error("Player ID is required to start turn");
      }

      const response: AxiosResponse<StartTurnApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/turns`,
        { playerId: id }
      );

      if (!response.data.success) {
        throw new Error("Failed to start turn");
      }
    },
    onSuccess: async () => {
      // Invalidate all game-related queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      // Also invalidate turn queries as a new turn was created
      await queryClient.invalidateQueries({ queryKey: ["turn"] });
    },
  });
};
