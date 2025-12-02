import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyPlayer } from "../queries/use-lobby-query";

interface AddPlayerResponse {
  success: boolean;
  players: LobbyPlayer[];
  gamePublicId: string;
}

const addPlayerApi = async (
  gameId: string,
  playerName: string,
  teamName: string,
): Promise<AddPlayerResponse> => {
  const response: AxiosResponse<AddPlayerResponse> = await api.post(`/games/${gameId}/players`, [
    { playerName, teamName },
  ]);

  if (!response.data.success) {
    throw new Error("Failed to add player");
  }

  return response.data;
};

export const useAddPlayerMutation = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerName, teamName }: { playerName: string; teamName: string }) =>
      addPlayerApi(gameId, playerName, teamName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};
