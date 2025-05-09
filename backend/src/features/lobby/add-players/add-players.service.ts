import { UnexpectedLobbyError } from "../errors/lobby.errors";
import {
  PublicId,
  GameFinder,
} from "@backend/common/data-access/games.repository";
import { PlayersCreator } from "@backend/common/data-access/players.repository";

/** Represents the result of a player addition operation */
export type PlayerResult = {
  playerId: number;
  gameId: number;
  teamId: number;
  playerName: string;
};

/** Data structure for adding player information */
export type PlayerAddData = {
  playerName: string;
  teamId: number;
}[];

/** Required dependencies for creating the AddPlayersService */
export type ServiceDependencies = {
  addPlayers: PlayersCreator;
  getGameByPublicId: GameFinder<PublicId>;
};

/** Creates an implementation of the add players service */
export const addPlayersService = (dependencies: ServiceDependencies) => {
  /**
   * Adds players to a game
   * @param publicGameId - Public identifier of the game
   * @param userId - ID of the user adding players
   * @param playersToAdd - Players to be added
   * @returns Added player details
   */
  const addPlayers = async (
    publicGameId: string,
    userId: number,
    playersToAdd: PlayerAddData,
  ): Promise<PlayerResult[]> => {
    if (!playersToAdd.length) return [];

    const game = await dependencies.getGameByPublicId(publicGameId);
    if (!game) {
      throw new UnexpectedLobbyError(
        `Game with public ID ${publicGameId} not found`,
      );
    }

    if (game.status !== "LOBBY") {
      throw new UnexpectedLobbyError(
        `Cannot add players to game in '${game.status}' state`,
      );
    }

    if (game.game_type === "MULTI_DEVICE" && playersToAdd.length > 1) {
      throw new UnexpectedLobbyError(
        "Multi-device games only allow adding one player at a time",
      );
    }

    const repositoryRequest = playersToAdd.map((player) => ({
      userId,
      gameId: game.id,
      teamId: player.teamId,
      publicName: player.playerName,
      statusId: 1,
    }));

    const newPlayers = await dependencies.addPlayers(repositoryRequest);

    return newPlayers.map((player) => ({
      playerId: player.id,
      gameId: player.gameId,
      teamId: player.teamId,
      playerName: player.publicName,
    }));
  };

  return addPlayers;
};
