import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

/** Where the AI model currently sits in the inference stack. */
export type HealthPlacement = "gpu" | "partial" | "cpu" | "not-loaded" | "unknown";

/** Server-reported health of the AI worker, surfaced in the status indicator. */
export interface AiHealth {
  placement: HealthPlacement;
  gpuPercent: number;
}

interface AiStatusApiResponse {
  success: boolean;
  data: {
    available: boolean;  // Is it AI's turn and can trigger?
    thinking: boolean;   // Is pipeline currently running?
    runId?: string;      // Current run ID if thinking
    health?: AiHealth;
  };
}

/** Per-game AI snapshot — whether the AI can act now and whether it's mid-think. */
export interface AiStatus {
  available: boolean;
  thinking: boolean;
  runId?: string;
  health?: AiHealth;
}

/**
 * Polls the per-game AI status endpoint.
 *
 * Idle by default; auto-polls every 2 seconds whenever the most recent
 * response had `thinking: true`, so the UI can reflect pipeline
 * progress without manual refetch. Throws on a non-success response so
 * the query enters the error state instead of caching a bad payload.
 */
export const useAiStatus = (gameId: string): UseQueryResult<AiStatus, Error> => {
  return useQuery({
    queryKey: ["game", gameId, "ai", "status"],
    queryFn: async () => {
      console.debug("[AI] Fetching AI status for game:", gameId);
      const response: AxiosResponse<AiStatusApiResponse> = await api.get(
        `/games/${gameId}/ai/status`,
      );

      if (!response.data.success) {
        console.debug("[AI] AI status fetch failed");
        throw new Error("Failed to fetch AI status");
      }

      console.debug("[AI] AI status:", response.data.data);
      return response.data.data;
    },
    refetchInterval: (query) => {
      // Poll while the pipeline is running so progress shows promptly.
      const interval = query.state.data?.thinking ? 2000 : false;
      if (interval) {
        console.debug("[AI] Polling AI status (thinking=true)");
      }
      return interval;
    },
  });
};
