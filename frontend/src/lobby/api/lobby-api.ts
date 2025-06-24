import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";


export interface PlayerAddData {
  playerName: string;
  teamName: string;
}

export interface PlayerUpdateData {
  playerId: string;
  playerName?: string;
  teamName?: string;
}

export interface LobbyPlayer {
  publicId: string;
  name: string;
  teamName: string;
}

export interface LobbyTeam {
  name: string;
  players: LobbyPlayer[];
}

export interface LobbyData {
  publicId: string;
  status: string;
  gameType: string;
  teams: LobbyTeam[];
  canModifyGame: boolean;
}


interface AddPlayersResponse {
  success: boolean;
  players: LobbyPlayer[];
  gamePublicId: string;
}

interface ModifyPlayerResponse {
  success: boolean;
  modifiedPlayers: LobbyPlayer[];
}

interface RemovePlayerResponse {
  success: boolean;
  removedPlayerId: string;
}

interface StartGameApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      status: string;
    };
  };
}

export interface GameStartedResult {
  publicId: string;
  status: string;
}

interface GetLobbyStateResponse {
  success: boolean;
  data: { game: LobbyData };
}


export const getLobbyState = async (gameId: string): Promise<LobbyData> => {
  const response: AxiosResponse<GetLobbyStateResponse> = await api.get(
    `/games/${gameId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to get lobby state");
  }

  return response.data.data.game;
};

export const addPlayers = async (
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

export const modifyPlayer = async (
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

export const modifyPlayers = async (
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

export const removePlayer = async (
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
 * Starts the game from lobby state.
 */
export const startGame = async (gameId: string): Promise<GameStartedResult> => {
  const response: AxiosResponse<StartGameApiResponse> = await api.post(
    `/games/${gameId}/start`,
  );

  if (!response.data.success) {
    throw new Error("Failed to start game");
  }

  return response.data.data.game;
};


export const addPlayer = async (
  gameId: string,
  playerName: string,
  teamName: string,
): Promise<AddPlayersResponse> => {
  return addPlayers(gameId, [{ playerName, teamName }]);
};

export const movePlayerToTeam = async (
  gameId: string,
  playerId: string,
  newTeamName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayer(gameId, playerId, { playerId, teamName: newTeamName });
};

export const renamePlayer = async (
  gameId: string,
  playerId: string,
  newPlayerName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayer(gameId, playerId, {
    playerId,
    playerName: newPlayerName,
  });
};
