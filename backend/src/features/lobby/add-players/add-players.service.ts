import type { PlayerRepository } from "@backend/common/data-access/players.repository";
import type { GameRepository } from "@backend/common/data-access/games.repository";
import { UnexpectedLobbyError } from "../errors/lobby.errors";
import { GAME_TYPE } from "@codenames/shared/types";

/**
 * Player result data
 */
export type PlayerResult = {
  playerId: number;
  gameId: number;
  teamId: number;
  playerName: string;
};

/**
 * Service interface for adding players to a game lobby
 */
export interface AddPlayersService {
  execute: (
    publicGameId: string,
    userId: number,
    playersData: {
      playerName: string;
      teamId: number;
    }[],
  ) => Promise<PlayerResult[]>;
}

/**
 * Dependencies required by the add players service
 */
export interface Dependencies {
  playerRepository: PlayerRepository;
  gameRepository: GameRepository;
}

/**
 * Creates a service instance for adding players to game lobbies
 */
export const create = ({
  playerRepository,
  gameRepository,
}: Dependencies): AddPlayersService => {
  /**
   * Adds one or more players to a game lobby
   * @param publicGameId Public ID of the game
   * @param userId ID of the authenticated user
   * @param playersData Array of player data
   * @returns Array of player results
   */
  const execute = async (
    publicGameId: string,
    userId: number,
    playersData: {
      playerName: string;
      teamId: number;
    }[],
  ): Promise<PlayerResult[]> => {
    // Handle empty array case
    if (playersData.length === 0) {
      return [];
    }

    // Get the game by its public ID
    const game = await gameRepository.getGameDataByPublicId(publicGameId);

    if (!game) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    // Check if game is in a valid state for adding players (should be in LOBBY state)
    if (game.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot add players to game in '${game.status}' state`,
      );
    }

    // Business rule validation - multi-device games can only add one player at a time
    if (game.game_type === GAME_TYPE.MULTI_DEVICE && playersData.length > 1) {
      throw new UnexpectedLobbyError(
        "Multi-device games only allow adding one player at a time",
      );
    }

    const existingPlayers = await playerRepository.getPlayersByGameId(game.id);
    const maxPlayersPerGame = 10;

    // todo: need to think about whether this is exceptional or not.. depends on how much client side
    // validation... otherwise I could return a result object for the controller to return 4xx response
    if (existingPlayers.length + playersData.length > maxPlayersPerGame) {
      throw new UnexpectedLobbyError(
        `Game has reached the maximum player limit of ${maxPlayersPerGame}`,
      );
    }

    // Transform the input data to the format required by the repository
    const playerCreateData = playersData.map((player) => ({
      userId,
      gameId: game.id,
      teamId: player.teamId,
      publicName: player.playerName,
      statusId: 1,
    }));

    // Add players to the game
    const players = await playerRepository.addPlayers(playerCreateData);

    // Format and return results
    return players.map((player) => ({
      playerId: player.id,
      gameId: player.game_id,
      teamId: player.team_id,
      playerName: player.public_name,
    }));
  };

  return {
    execute,
  };
};
