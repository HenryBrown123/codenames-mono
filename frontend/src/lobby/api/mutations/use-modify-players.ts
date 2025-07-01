import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { LobbyPlayer } from "../queries/use-lobby-query";

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

export const useMovePlayerToTeam = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, newTeamName }: { playerId: string; newTeamName: string }) => 
      movePlayerToTeamApi(gameId, playerId, newTeamName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};

export const useRenamePlayer = (gameId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, newPlayerName }: { playerId: string; newPlayerName: string }) => 
      renamePlayerApi(gameId, playerId, newPlayerName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby", gameId] });
    },
  });
};