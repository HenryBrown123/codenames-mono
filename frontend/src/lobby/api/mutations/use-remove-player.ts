import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyData } from "../queries/use-lobby-query";

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

/**
 * Removes a player from the lobby with optimistic update
 */
export const useRemovePlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => removePlayerApi(gameId, playerId),
    onMutate: async (playerId) => {
      await queryClient.cancelQueries({ queryKey: ["lobby", gameId] });
      
      const previousLobby = queryClient.getQueryData<LobbyData>(["lobby", gameId]);
      
      if (previousLobby) {
        const updatedLobby = {
          ...previousLobby,
          teams: previousLobby.teams.map(team => ({
            ...team,
            players: team.players.filter(player => player.publicId !== playerId),
          })),
        };
        
        queryClient.setQueryData(["lobby", gameId], updatedLobby);
      }
      
      return { previousLobby };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLobby) {
        queryClient.setQueryData(["lobby", gameId], context.previousLobby);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};
