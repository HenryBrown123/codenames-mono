import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { usePlayerContext } from "../../game-data/providers/player-context-provider";

interface EndTurnApiResponse {
  success: boolean;
  data: {
    turn: {
      id: string;
      teamName: string;
      status: string;
      completedAt: string;
    };
  };
}

interface EndTurnInput {
  roundNumber: number;
}

/**
 * Ends the current turn.
 */
export const useEndTurnMutation = (
  gameId: string,
): UseMutationResult<void, Error, EndTurnInput> => {
  const queryClient = useQueryClient();
  const { currentPlayerId } = usePlayerContext();

  return useMutation({
    mutationFn: async ({ roundNumber }) => {
      if (!currentPlayerId) {
        throw new Error("Player ID is required to end turn");
      }

      const response: AxiosResponse<EndTurnApiResponse> = await api.post(
        `/games/${gameId}/rounds/${roundNumber}/end-turn`,
        { playerId: currentPlayerId }
      );

      if (!response.data.success) {
        throw new Error("Failed to end turn");
      }
    },
    onSuccess: async () => {
      // Invalidate all game-related queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      // Also invalidate turn queries as the turn status changed
      await queryClient.invalidateQueries({ queryKey: ["turn"] });
    },
  });
};
