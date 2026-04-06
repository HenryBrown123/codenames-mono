import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { LobbyPlayer, LobbyData } from "../queries/use-lobby-query";

interface ModifyPlayerResponse {
  success: boolean;
  modifiedPlayers: LobbyPlayer[];
}

const movePlayerApi = async (
  gameId: string,
  playerId: string,
  newTeamName: string,
): Promise<ModifyPlayerResponse> => {
  const response: AxiosResponse<ModifyPlayerResponse> = await api.patch(
    `/games/${gameId}/players/${playerId}`,
    { playerId, teamName: newTeamName },
  );

  if (!response.data.success) {
    throw new Error("Failed to move player");
  }

  return response.data;
};

export const useMovePlayerMutation = (gameId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["lobby", gameId];

  return useMutation({
    mutationFn: ({ playerId, newTeamName }: { playerId: string; newTeamName: string }) =>
      movePlayerApi(gameId, playerId, newTeamName),
    onMutate: async ({ playerId, newTeamName }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousLobby = queryClient.getQueryData<LobbyData>(queryKey);

      if (previousLobby) {
        const movedPlayer = previousLobby.teams
          .flatMap((t) => t.players)
          .find((p) => p.publicId === playerId);

        if (movedPlayer) {
          const updatedLobby = {
            ...previousLobby,
            teams: previousLobby.teams.map((team) => {
              if (team.players.some((p) => p.publicId === playerId)) {
                return {
                  ...team,
                  players: team.players.filter((p) => p.publicId !== playerId),
                };
              }

              if (team.name === newTeamName) {
                return {
                  ...team,
                  players: [...team.players, { ...movedPlayer, teamName: newTeamName }],
                };
              }

              return team;
            }),
          };

          queryClient.setQueryData(queryKey, updatedLobby);
        }
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
