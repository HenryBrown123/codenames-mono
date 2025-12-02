import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyData } from "../queries/use-lobby-query";

interface RemovePlayerResponse {
  success: boolean;
  removedPlayerId: string;
}

const removePlayerApi = async (gameId: string, playerId: string): Promise<RemovePlayerResponse> => {
  const response: AxiosResponse<RemovePlayerResponse> = await api.delete(
    `/games/${gameId}/players/${playerId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to remove player");
  }

  return response.data;
};

export const useRemovePlayerMutation = (gameId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["lobby", gameId];

  return useMutation({
    mutationFn: (playerId: string) => removePlayerApi(gameId, playerId),
    onMutate: async (playerId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousLobby = queryClient.getQueryData<LobbyData>(queryKey);

      if (previousLobby) {
        const updatedLobby = {
          ...previousLobby,
          teams: previousLobby.teams.map((team) => ({
            ...team,
            players: team.players.filter((player) => player.publicId !== playerId),
          })),
        };

        queryClient.setQueryData(queryKey, updatedLobby);
      }

      return { previousLobby };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLobby) {
        queryClient.setQueryData(queryKey, context.previousLobby);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
