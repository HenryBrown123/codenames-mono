import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface AiStatusApiResponse {
  success: boolean;
  data: {
    available: boolean;  // Is it AI's turn and can trigger?
    thinking: boolean;   // Is pipeline currently running?
    runId?: string;      // Current run ID if thinking
  };
}

export interface AiStatus {
  available: boolean;
  thinking: boolean;
  runId?: string;
}

/**
 * Fetches the current AI status for a game.
 * Returns whether AI can be triggered and if it's currently thinking.
 */
export const useAiStatus = (gameId: string): UseQueryResult<AiStatus, Error> => {
  return useQuery({
    queryKey: ["game", gameId, "ai", "status"],
    queryFn: async () => {
      const response: AxiosResponse<AiStatusApiResponse> = await api.get(
        `/games/${gameId}/ai/status`,
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch AI status");
      }

      return response.data.data;
    },
    refetchInterval: (query) => {
      // Poll every 2 seconds if AI is thinking
      return query.state.data?.thinking ? 2000 : false;
    },
  });
};
