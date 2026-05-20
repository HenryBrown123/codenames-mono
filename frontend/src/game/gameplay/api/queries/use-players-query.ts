import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

/** A single player entry as returned by the players-list endpoint. */
export interface Player {
  publicId: string;
  name: string;
  teamName: string;
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
  status: "ACTIVE" | "WAITING";
  isAi: boolean;
}

interface PlayersApiResponse {
  success: boolean;
  data: {
    players: Player[];
  };
}

const fetchPlayers = async (gameId: string): Promise<Player[]> => {
  const response: AxiosResponse<PlayersApiResponse> = await api.get(
    `/games/${gameId}/players`
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch players data");
  }

  return response.data.data.players;
};

/**
 * Loads the player roster with live status.
 *
 * Refetches on window focus and has `staleTime: 0`, so the player
 * pills always reflect the latest server state when a tab regains
 * focus. Disabled until a `gameId` is supplied.
 */
export const usePlayersQuery = (
  gameId: string | null,
): UseQueryResult<Player[], Error> => {
  return useQuery<Player[]>({
    queryKey: ["players", gameId],
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      return fetchPlayers(gameId);
    },
    enabled: !!gameId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};