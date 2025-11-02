import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyPlayer, LobbyData } from "../queries/use-lobby-query";

export interface PlayerUpdateData {
  playerId: string;
  playerName?: string;
  teamName?: string;
}

interface ModifyPlayerResponse {
  success: boolean;
  modifiedPlayers: LobbyPlayer[];
}

const modifyPlayerApi = async (
  gameId: string,
  playerId: string,
  updates: PlayerUpdateData,
): Promise<ModifyPlayerResponse> => {
  const response: AxiosResponse<ModifyPlayerResponse> = await api.patch(
    `/games/${gameId}/players/${playerId}`,
    updates,
  );

  if (!response.data.success) {
    throw new Error("Failed to modify player");
  }

  return response.data;
};

const modifyPlayersApi = async (
  gameId: string,
  updates: Array<{ playerId: string } & PlayerUpdateData>,
): Promise<ModifyPlayerResponse> => {
  const response: AxiosResponse<ModifyPlayerResponse> = await api.patch(
    `/games/${gameId}/players`,
    updates,
  );

  if (!response.data.success) {
    throw new Error("Failed to modify players");
  }

  return response.data;
};

const movePlayerToTeamApi = async (
  gameId: string,
  playerId: string,
  newTeamName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayerApi(gameId, playerId, { playerId, teamName: newTeamName });
};

const renamePlayerApi = async (
  gameId: string,
  playerId: string,
  newPlayerName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayerApi(gameId, playerId, {
    playerId,
    playerName: newPlayerName,
  });
};

export const useModifyPlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, updates }: { playerId: string; updates: PlayerUpdateData }) =>
      modifyPlayerApi(gameId, playerId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};

export const useModifyPlayers = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ playerId: string } & PlayerUpdateData>) =>
      modifyPlayersApi(gameId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};

/**
 * Moves a player to a different team with optimistic update
 */
export const useMovePlayerToTeam = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, newTeamName }: { playerId: string; newTeamName: string }) =>
      movePlayerToTeamApi(gameId, playerId, newTeamName),
    onMutate: async ({ playerId, newTeamName }) => {
      await queryClient.cancelQueries({ queryKey: ["lobby", gameId] });

      const previousLobby = queryClient.getQueryData<LobbyData>(["lobby", gameId]);

      if (previousLobby) {
        const updatedLobby = {
          ...previousLobby,
          teams: previousLobby.teams
            .map((team) => {
              const playerInTeam = team.players.find((p) => p.publicId === playerId);

              if (playerInTeam) {
                return {
                  ...team,
                  players: team.players.filter((p) => p.publicId !== playerId),
                };
              }

              if (team.name === newTeamName && playerInTeam) {
                return {
                  ...team,
                  players: [...team.players, { playerInTeam, teamName: newTeamName }],
                };
              }

              return team;
            })
            .map((team) => {
              if (team.name === newTeamName) {
                const movedPlayer = previousLobby.teams
                  .flatMap((t) => t.players)
                  .find((p) => p.publicId === playerId);

                if (movedPlayer && !team.players.find((p) => p.publicId === playerId)) {
                  return {
                    ...team,
                    players: [...team.players, { ...movedPlayer, teamName: newTeamName }],
                  };
                }
              }
              return team;
            }),
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

/**
 * Renames a player with optimistic update
 */
export const useRenamePlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, newPlayerName }: { playerId: string; newPlayerName: string }) =>
      renamePlayerApi(gameId, playerId, newPlayerName),
    onMutate: async ({ playerId, newPlayerName }) => {
      await queryClient.cancelQueries({ queryKey: ["lobby", gameId] });

      const previousLobby = queryClient.getQueryData<LobbyData>(["lobby", gameId]);

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
