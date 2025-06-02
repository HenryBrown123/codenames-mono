import { UnexpectedLobbyError } from "../errors/lobby.errors";
import {
  PlayerFinder,
  PlayerRemover,
  PublicPlayerId,
} from "@backend/common/data-access/players.repository";
import {
  GameFinder,
  PublicId,
} from "@backend/common/data-access/games.repository";
import { GAME_STATE } from "@codenames/shared/types";

/** Represents the result of a player removal operation */
export type PlayerResult = {
  publicId: string;
  playerName: string;
  username?: string;
  teamName: string;
  statusId: number;
};

/** Service response including game context */
export type RemovePlayersServiceResult = {
  removedPlayer: PlayerResult;
  gamePublicId: string;
};

/** Required dependencies for creating the RemovePlayersService */
export type ServiceDependencies = {
  removePlayer: PlayerRemover;
  getPlayer: PlayerFinder<PublicPlayerId>;
  getGameByPublicId: GameFinder<PublicId>;
};

/** Creates an implementation of the remove players service */
export const removePlayersService = (dependencies: ServiceDependencies) => {
  /**
   * Removes a specific player from a game
   * @param publicGameId - Public identifier of the game
   * @param userId - ID of the user attempting to remove the player
   * @param playerIdToRemove - Public UUID of the player to remove
   * @returns Removed player details and game context
   */
  const removePlayerImpl = async (
    publicGameId: string,
    userId: number,
    playerIdToRemove: string,
  ): Promise<RemovePlayersServiceResult> => {
    const game = await dependencies.getGameByPublicId(publicGameId);
    if (!game) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    if (game.status !== GAME_STATE.LOBBY) {
      throw new UnexpectedLobbyError(
        `Cannot remove players from game in '${game.status}' state`,
      );
    }

    const playerToRemove = await dependencies.getPlayer(playerIdToRemove);
    if (!playerToRemove || playerToRemove._gameId !== game._id) {
      throw new UnexpectedLobbyError(
        `Player ${playerIdToRemove} not found in this game`,
      );
    }

    if (playerToRemove._userId !== userId) {
      throw new UnexpectedLobbyError(
        "You do not have permission to remove this player",
      );
    }

    const removedPlayer = await dependencies.removePlayer(playerToRemove._id);

    if (!removedPlayer) {
      throw new UnexpectedLobbyError(
        `Failed to remove player ${playerIdToRemove}`,
      );
    }

    return {
      removedPlayer: {
        publicId: removedPlayer.publicId,
        playerName: removedPlayer.publicName,
        username: undefined, // Could be enriched with user data if needed
        teamName: removedPlayer.teamName,
        statusId: removedPlayer.statusId,
      },
      gamePublicId: game.public_id,
    };
  };

  return removePlayerImpl;
};
