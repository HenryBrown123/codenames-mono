import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

export interface Player {
  publicId: string;
  name: string;
  teamName: string;
  role: "CODEMASTER" | "CODEBREAKER" | "SPECTATOR" | "NONE";
  status: "ACTIVE" | "WAITING";
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
 * Fetches and caches players data with their current status.
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