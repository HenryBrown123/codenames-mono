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
import { GAME_STATE } from "@codenames/shared/types";

/** Represents the result of a player removal operation */
export type PlayerResult = {
  _id: number;
  _gameId: number;
  _teamId: number;
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

    const removedPlayer = await dependencies.removePlayer(playerIdToRemove);

    if (!removedPlayer) {
      throw new UnexpectedLobbyError(
        `Failed to remove player ${playerIdToRemove}`,
      );
    }

    return {
      _id: removedPlayer._id,
      _gameId: removedPlayer._gameId,
      _teamId: removedPlayer._teamId,
      playerName: removedPlayer.publicName,
    };
  };

  return removePlayerImpl;
};
