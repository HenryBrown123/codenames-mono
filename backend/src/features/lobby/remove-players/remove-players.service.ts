import { UnexpectedLobbyError } from "../errors/lobby.errors";
import {
  PlayerFinder,
  PlayerRemover,
  PlayerId,
} from "@backend/common/data-access/players.repository";
import {
  GameFinder,
  PublicId,
} from "@backend/common/data-access/games.repository";

/** Represents the result of a player removal operation */
export type PlayerResult = {
  playerId: number;
  gameId: number;
  teamId: number;
  playerName: string;
};

/** Required dependencies for creating the RemovePlayersService */
export type ServiceDependencies = {
  removePlayer: PlayerRemover;
  getPlayer: PlayerFinder<PlayerId>;
  getGameByPublicId: GameFinder<PublicId>;
};

/** Creates an implementation of the remove players service */
export const removePlayersService = (dependencies: ServiceDependencies) => {
  /**
   * Removes a specific player from a game
   * @param publicGameId - Public identifier of the game
   * @param userId - ID of the user attempting to remove the player
   * @param playerIdToRemove - ID of the player to remove
   * @returns Removed player details
   */
  const removePlayerImpl = async (
    publicGameId: string,
    userId: number,
    playerIdToRemove: number,
  ): Promise<PlayerResult> => {
    const game = await dependencies.getGameByPublicId(publicGameId);
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

    const playerToRemove = await dependencies.getPlayer(playerIdToRemove);
    if (!playerToRemove || playerToRemove.gameId !== game.id) {
      throw new UnexpectedLobbyError(
        `Player ${playerIdToRemove} not found in this game`,
      );
    }

    if (playerToRemove.userId !== userId) {
      throw new UnexpectedLobbyError(
        "You do not have permission to remove this player",
      );
    }

    const remainingPlayers = await dependencies.removePlayer(playerIdToRemove);

    if (!remainingPlayers) {
      throw new UnexpectedLobbyError(
        `Failed to remove player ${playerIdToRemove}`,
      );
    }

    return {
      playerId: remainingPlayers.id,
      gameId: remainingPlayers.gameId,
      teamId: remainingPlayers.teamId,
      playerName: remainingPlayers.publicName,
    };
  };

  return removePlayerImpl;
};
