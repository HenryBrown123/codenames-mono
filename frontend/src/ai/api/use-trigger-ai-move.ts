import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface TriggerAiMoveApiResponse {
  success: boolean;
  data?: {
    runId: string;
    pipelineType: string;
    startedAt: string;
  };
  error?: string;
}

/**
 * Triggers the AI to check game state and make a move if needed.
 * Useful for testing or manually triggering AI action.
 */
export const useTriggerAiMove = (gameId: string): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.debug("[AI] Triggering AI move for game:", gameId);
      const response: AxiosResponse<TriggerAiMoveApiResponse> = await api.post(
        `/games/${gameId}/ai/move`,
      );

      if (!response.data.success) {
        console.debug("[AI] Trigger AI move failed");
        throw new Error("Failed to trigger AI move");
      }

      console.debug("[AI] AI move triggered successfully:", response.data.data);
    },
    onSuccess: async () => {
      console.debug("[AI] Invalidating queries after AI move trigger");
      // Invalidate game data and AI status
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      await queryClient.invalidateQueries({ queryKey: ["game", gameId, "ai", "status"] });
    },
    onError: (error) => {
      console.debug("[AI] AI move trigger error:", error);
    },
  });
};
