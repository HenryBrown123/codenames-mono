import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

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
 * Mutation that nudges the server to run the AI pipeline for this game.
 *
 * On success, invalidates both `gameData` and the AI status query so
 * the next poll picks up the new pipeline run. Primarily a manual /
 * test hook — normal play has the AI react to its own turn server-side.
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
      await queryClient.invalidateQueries({ queryKey: ["gameData", gameId] });
      await queryClient.invalidateQueries({ queryKey: ["game", gameId, "ai", "status"] });
    },
    onError: (error) => {
      console.debug("[AI] AI move trigger error:", error);
    },
  });
};
