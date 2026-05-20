import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import type { GameEvent } from "./events.types";

interface GameEventsApiResponse {
  success: boolean;
  data: GameEvent[];
}

const fetchGameEvents = async (gameId: string): Promise<GameEvent[]> => {
  const response: AxiosResponse<GameEventsApiResponse> = await api.get(`/games/${gameId}/events`);

  if (!response.data.success) {
    throw new Error("Failed to fetch game events");
  }

  return response.data.data;
};

/**
 * Loads every recorded event for a game in chronological order.
 *
 * Events are append-only on the server, so this is cached aggressively
 * (30s stale time, no refetch on window focus). Disabled when no
 * `gameId` is supplied so the component tree can mount before the
 * route param resolves.
 */
export const useGameEvents = (gameId: string | null): UseQueryResult<GameEvent[], Error> => {
  return useQuery<GameEvent[]>({
    queryKey: ["game-events", gameId],
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      return fetchGameEvents(gameId);
    },
    enabled: !!gameId,
    refetchOnWindowFocus: false, // Events are immutable once created
    staleTime: 30000, // Events don't change frequently, cache for 30 seconds
  });
};
