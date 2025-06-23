import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import {
  GameData,
  GameStateApiResponse,
  transformApiResponseToGameData,
} from "@frontend/shared-types";

/**
 * Fetches game state from the new backend API
 * GET /games/{gameId}
 */
const fetchGame = async (gameId: string): Promise<GameData> => {
  const response: AxiosResponse<GameStateApiResponse> = await api.get(
    `/games/${gameId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch game data");
  }

  // Transform API response to UI-friendly format
  return transformApiResponseToGameData(response.data);
};

/**
 * Query hook for fetching game data
 * @param gameId - The game ID to fetch, can be null
 * @returns React Query result with GameData
 */
export const useGameDataQuery = (
  gameId: string | null,
): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["gameData", gameId],
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      return fetchGame(gameId);
    },
    enabled: !!gameId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
