import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

interface RemovePlayerResponse {
  success: boolean;
  removedPlayerId: string;
}

const removePlayerApi = async (
  gameId: string,
  playerId: string,
): Promise<RemovePlayerResponse> => {
  const response: AxiosResponse<RemovePlayerResponse> = await api.delete(
    `/games/${gameId}/players/${playerId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to remove player");
  }

  return response.data;
};

export const useRemovePlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => removePlayerApi(gameId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};