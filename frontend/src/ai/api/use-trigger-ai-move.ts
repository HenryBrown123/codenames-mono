import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface TriggerAiMoveApiResponse {
  success: boolean;
  message: string;
}

/**
 * Triggers the AI to check game state and make a move if needed.
 * Useful for testing or manually triggering AI action.
 */
export const useTriggerAiMove = (gameId: string): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response: AxiosResponse<TriggerAiMoveApiResponse> = await api.post(
        `/games/${gameId}/ai/move`,
      );

      if (!response.data.success) {
        throw new Error("Failed to trigger AI move");
      }
    },
    onSuccess: async () => {
      // Invalidate game data and AI status
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      await queryClient.invalidateQueries({ queryKey: ["game", gameId, "ai", "status"] });
    },
  });
};
