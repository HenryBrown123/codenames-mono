import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyPlayer } from "../queries/use-lobby-query";

export interface PlayerAddData {
  playerName: string;
  teamName: string;
}

interface AddPlayersResponse {
  success: boolean;
  players: LobbyPlayer[];
  gamePublicId: string;
}

const addPlayersApi = async (
  gameId: string,
  playersToAdd: PlayerAddData[],
): Promise<AddPlayersResponse> => {
  const response: AxiosResponse<AddPlayersResponse> = await api.post(
    `/games/${gameId}/players`,
    playersToAdd,
  );

  if (!response.data.success) {
    throw new Error("Failed to add players");
  }

  return response.data;
};

const addPlayerApi = async (
  gameId: string,
  playerName: string,
  teamName: string,
): Promise<AddPlayersResponse> => {
  return addPlayersApi(gameId, [{ playerName, teamName }]);
};

export const useAddPlayers = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playersToAdd: PlayerAddData[]) => addPlayersApi(gameId, playersToAdd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};

export const useAddPlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerName, teamName }: { playerName: string; teamName: string }) => 
      addPlayerApi(gameId, playerName, teamName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};