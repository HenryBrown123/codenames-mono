import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { LobbyPlayer, LobbyData } from "../queries/use-lobby-query";

interface ModifyPlayerResponse {
  success: boolean;
  modifiedPlayers: LobbyPlayer[];
}

const renamePlayerApi = async (
  gameId: string,
  playerId: string,
  newPlayerName: string,
): Promise<ModifyPlayerResponse> => {
  const response: AxiosResponse<ModifyPlayerResponse> = await api.patch(
    `/games/${gameId}/players/${playerId}`,
    { playerId, playerName: newPlayerName },
  );

  if (!response.data.success) {
    throw new Error("Failed to rename player");
  }

  return response.data;
};

export const useRenamePlayerMutation = (gameId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["lobby", gameId];

  return useMutation({
    mutationFn: ({ playerId, newPlayerName }: { playerId: string; newPlayerName: string }) =>
      renamePlayerApi(gameId, playerId, newPlayerName),
    onMutate: async ({ playerId, newPlayerName }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousLobby = queryClient.getQueryData<LobbyData>(queryKey);

      if (previousLobby) {
        const updatedLobby = {
          ...previousLobby,
          teams: previousLobby.teams.map((team) => ({
            ...team,
            players: team.players.map((player) =>
              player.publicId === playerId ? { ...player, name: newPlayerName } : player,
            ),
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
