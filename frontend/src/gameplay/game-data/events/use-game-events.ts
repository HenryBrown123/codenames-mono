import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import type { GameEvent } from "./events.types";

interface GameEventsApiResponse {
  success: boolean;
  data: GameEvent[];
}

/**
 * Fetches all events for a game from the server
 */
const fetchGameEvents = async (gameId: string): Promise<GameEvent[]> => {
  const response: AxiosResponse<GameEventsApiResponse> = await api.get(`/games/${gameId}/events`);

  if (!response.data.success) {
    throw new Error("Failed to fetch game events");
  }

  return response.data.data;
};

/**
 * Hook to fetch and cache all events for a game.
 * Events are returned in chronological order (oldest first).
 *
 * @param gameId - The game ID to fetch events for
 * @returns Query result containing array of GameEvent objects
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
