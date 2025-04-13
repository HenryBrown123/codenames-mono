import type { PlayerRepository } from "@backend/common/data-access/players.repository";
import type { GameRepository } from "@backend/common/data-access/games.repository";
import { UnexpectedLobbyError } from "../errors/lobby.errors";

/**
 * Service interface for removing players from a game lobby
 */
export interface RemovePlayersService {
  execute: (
    publicGameId: string,
    userId: number,
    playerIdToRemove: number,
  ) => Promise<{
    playersData: {
      playerName: string;
      teamId: number;
    }[];
    gameId: string;
  }>;
}

/**
 * Dependencies required by the remove players service
 */
export interface Dependencies {
  playerRepository: PlayerRepository;
  gameRepository: GameRepository;
}

/**
 * Creates a service instance for removing players from game lobbies
 */
export const create = ({
  playerRepository,
  gameRepository,
}: Dependencies): RemovePlayersService => {
  /**
   * Removes a player from a game lobby
   * @param publicGameId Public ID of the game
   * @param userId ID of the authenticated user
   * @param playerIdToRemove ID of the player to remove
   * @returns Updated list of players and game ID
   */
  const execute = async (
    publicGameId: string,
    userId: number,
    playerIdToRemove: number,
  ) => {
    const game = await gameRepository.getGameDataByPublicId(publicGameId);

    if (!game) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    if (game.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot remove players from game in '${game.status}' state`,
      );
    }

    // Get the player to be removed
    const playerToRemove =
      await playerRepository.getPlayerById(playerIdToRemove);

    if (!playerToRemove || playerToRemove.game_id !== game.id) {
      throw new UnexpectedLobbyError(
        `Player ${playerIdToRemove} not found in this game`,
      );
    }

    // Check if user has permission to remove the player
    // This could be expanded based on specific game rules
    if (playerToRemove.user_id !== userId) {
      throw new UnexpectedLobbyError(
        "You do not have permission to remove this player",
      );
    }

    await playerRepository.removePlayer(playerIdToRemove);

    const remainingPlayers = await playerRepository.getPlayersByGameId(game.id);

    // Transform players to PlayerResult type
    const players = remainingPlayers.map((player) => ({
      playerId: player.id,
      gameId: player.game_id,
      teamId: player.team_id,
      playerName: player.public_name,
      userId: player.user_id,
      // You might want to add logic to determine host status
      isHost: false,
    }));

    return {
      playersData: players,
      gameId: publicGameId,
    };
  };

  return {
    execute,
  };
};
