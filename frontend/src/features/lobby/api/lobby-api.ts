import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";

// ==========================================
// TYPES
// ==========================================

export interface PlayerAddData {
  playerName: string;
  teamName: string;
}

export interface PlayerUpdateData {
  playerName?: string;
  teamName?: string;
}

export interface LobbyPlayer {
  publicId: string;
  playerName: string;
  teamName: string;
}

export interface LobbyTeam {
  teamName: string;
  players: LobbyPlayer[];
}

export interface LobbyData {
  publicId: string;
  status: string;
  gameType: string;
  teams: LobbyTeam[];
  canModifyGame: boolean;
}

// ==========================================
// API RESPONSE INTERFACES
// ==========================================

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

interface StartGameResponse {
  success: boolean;
  gameId?: string;
  publicId?: string;
  status?: string;
  error?: string;
}

interface GetLobbyStateResponse {
  success: boolean;
  data: LobbyData;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Get current lobby state
 * Note: There's no specific /lobby endpoint, so we'll need to create one
 * or get this data from the game endpoint
 */
export const getLobbyState = async (gameId: string): Promise<LobbyData> => {
  // For now, we'll try to get game state and transform it to lobby format
  // You may need to create a /lobby endpoint on your backend
  const response: AxiosResponse<GetLobbyStateResponse> = await api.get(
    `/games/${gameId}`,
  );

  if (!response.data.success) {
    console.error("Failed to get lobby state", response.data);
    throw new Error("Failed to get lobby state");
  }

  console.log("Lobby state retrieved!");
  return response.data.data;
};

/**
 * Add players to the lobby
 */
export const addPlayers = async (
  gameId: string,
  playersToAdd: PlayerAddData[],
): Promise<AddPlayersResponse> => {
  const response: AxiosResponse<AddPlayersResponse> = await api.post(
    `/games/${gameId}/players`,
    playersToAdd,
  );

  if (!response.data.success) {
    console.error("Failed to add players", response.data);
    throw new Error("Failed to add players");
  }

  console.log("Players added successfully!");
  return response.data;
};

/**
 * Modify a single player
 */
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
    console.error("Failed to modify player", response.data);
    throw new Error("Failed to modify player");
  }

  console.log("Player modified successfully!");
  return response.data;
};

/**
 * Modify multiple players (batch update)
 */
export const modifyPlayers = async (
  gameId: string,
  updates: Array<{ playerId: string } & PlayerUpdateData>,
): Promise<ModifyPlayerResponse> => {
  const response: AxiosResponse<ModifyPlayerResponse> = await api.patch(
    `/games/${gameId}/players`,
    updates,
  );

  if (!response.data.success) {
    console.error("Failed to modify players", response.data);
    throw new Error("Failed to modify players");
  }

  console.log("Players modified successfully!");
  return response.data;
};

/**
 * Remove a player from the lobby
 */
export const removePlayer = async (
  gameId: string,
  playerId: string,
): Promise<RemovePlayerResponse> => {
  const response: AxiosResponse<RemovePlayerResponse> = await api.delete(
    `/games/${gameId}/players/${playerId}`,
  );

  if (!response.data.success) {
    console.error("Failed to remove player", response.data);
    throw new Error("Failed to remove player");
  }

  console.log("Player removed successfully!");
  return response.data;
};

/**
 * Start the game
 */
export const startGame = async (gameId: string): Promise<StartGameResponse> => {
  const response: AxiosResponse<StartGameResponse> = await api.post(
    `/games/${gameId}/start`,
  );

  if (!response.data.success) {
    console.error("Failed to start game", response.data);
    throw new Error(response.data.error || "Failed to start game");
  }

  console.log("Game started successfully!");
  return response.data;
};

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Add a single player (convenience wrapper)
 */
export const addPlayer = async (
  gameId: string,
  playerName: string,
  teamName: string,
): Promise<AddPlayersResponse> => {
  return addPlayers(gameId, [{ playerName, teamName }]);
};

/**
 * Move a player to a different team
 */
export const movePlayerToTeam = async (
  gameId: string,
  playerId: string,
  newTeamName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayer(gameId, playerId, { teamName: newTeamName });
};

/**
 * Rename a player
 */
export const renamePlayer = async (
  gameId: string,
  playerId: string,
  newPlayerName: string,
): Promise<ModifyPlayerResponse> => {
  return modifyPlayer(gameId, playerId, { playerName: newPlayerName });
};
