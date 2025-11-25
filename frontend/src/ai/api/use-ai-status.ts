import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface PipelineRun {
  id: string;
  gameId: string;
  playerId: number;
  pipelineType: "SPYMASTER" | "GUESSER";
  status: "RUNNING" | "COMPLETE" | "FAILED";
  errorMessage: string | null;
  spymasterResponse: {
    clue: {
      word: string;
      targetCardCount: number;
    };
    reasoning: string;
  } | null;
  prefilterResponse: {
    candidateWords: string[];
    reasoning: string;
  } | null;
  rankerResponse: {
    rankedWords: Array<{
      word: string;
      score: number;
      reasoning: string;
    }>;
  } | null;
  createdAt: string;
  completedAt: string | null;
}

interface AiStatusApiResponse {
  success: boolean;
  data: {
    pipelines: PipelineRun[];
  };
}

export interface AiStatus {
  pipelines: PipelineRun[];
  hasRunningPipeline: boolean;
  latestPipeline: PipelineRun | null;
}

/**
 * Fetches the current AI pipeline status for a game.
 * Shows all pipeline runs with their stages and results.
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

      const pipelines = response.data.data.pipelines;
      const hasRunningPipeline = pipelines.some((p) => p.status === "RUNNING");
      const latestPipeline = pipelines.length > 0 ? pipelines[0] : null;

      return {
        pipelines,
        hasRunningPipeline,
        latestPipeline,
      };
    },
    refetchInterval: (query) => {
      // Poll every 2 seconds if there's a running pipeline
      return query.state.data?.hasRunningPipeline ? 2000 : false;
    },
  });
};
