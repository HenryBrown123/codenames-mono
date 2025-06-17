import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GameData } from "@frontend/shared-types";
import fetchGame from "./fetch-game";

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
    // Consider adding these options based on your needs:
    // staleTime: 30 * 1000, // Consider data stale after 30 seconds
    // refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    // refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};
