import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";

export interface LobbyPlayer {
  publicId: string;
  name: string;
  teamName: string;
  userId?: number;  // For multi-device: identifies which user owns this player
  username?: string;  // Username of the player's owner
}

export interface LobbyTeam {
  name: string;
  players: LobbyPlayer[];
}

export interface LobbyData {
  publicId: string;
  status: string;
  gameType: string;
  aiMode: boolean;
  teams: LobbyTeam[];
  canModifyGame: boolean;
  playerContext: {
    publicId: string;
    playerName: string;
    teamName: string;
    role: string;
  } | null;
}

interface GetLobbyStateResponse {
  success: boolean;
  data: { game: LobbyData };
}

const fetchLobbyState = async (gameId: string): Promise<LobbyData> => {
  const response: AxiosResponse<GetLobbyStateResponse> = await api.get(`/games/${gameId}`);

  if (!response.data.success) {
    throw new Error("Failed to get lobby state");
  }

  return response.data.data.game;
};

/**
 * Fetches and caches lobby state data.
 */
export const useLobbyQuery = (gameId: string | null): UseQueryResult<LobbyData, Error> => {
  return useQuery<LobbyData>({
    queryKey: ["lobby", gameId],
    queryFn: () => {
      if (!gameId) {
        throw new Error("Game ID is required");
      }
      return fetchLobbyState(gameId);
    },
    enabled: !!gameId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
