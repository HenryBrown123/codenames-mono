import { UnexpectedLobbyError } from "../errors/lobby.errors";
import { PlayersUpdater } from "@backend/common/data-access/players.repository";
import {
  GameFinder,
  PublicId,
} from "@backend/common/data-access/games.repository";

/**
 * Represents the result of a player modification operation
 */
export type PlayerResult = {};

/**
 * Data structure for updating player information
 */
export type PlayerUpdateData = {
  playerId: number;
  playerName?: string;
  teamId?: number;
}[];

/**
 * Service interface for modifying player data
 */
export interface ModifyPlayersService {
  /**
   * Updates multiple players with new information
   * @param publicGameId - Public identifier for the game
   * @param playersToModify - Array of player data to update
   * @returns Promise resolving to array of updated player results
   */
  updatePlayers: (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ) => Promise<PlayerResult[]>;
}

/**
 * Required dependencies for creating the ModifyPlayersService
 */
export type ServiceDependencies = {
  modifyPlayers: PlayersUpdater;
  getGameByPublicId: GameFinder<PublicId>;
};

/**
 * Creates and returns an implementation of the ModifyPlayersService
 * @param dependencies - Required repositories for service operations
 * @returns Configured ModifyPlayersService instance
 */
export const modifyPlayersService = (
  dependencies: ServiceDependencies,
): ModifyPlayersService => {
  const { modifyPlayers, getGameByPublicId } = dependencies;

  /**
   * Updates multiple players with new information
   * @param publicGameId - Public identifier for the game
   * @param playersToModify - Array of player data to update
   * @returns Promise resolving to array of updated player results
   * @throws {UnexpectedLobbyError} If the game does not exist
   */
  const updatePlayers = async (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ): Promise<PlayerResult[]> => {
    if (!playersToModify.length) {
      return [];
    }

    const game = await getGameByPublicId(publicGameId);

    if (!game) {
      throw new UnexpectedLobbyError(
        "Failed to modifiy players... game does not exist",
      );
    }

    const repositoryRequest = playersToModify.map((player) => {
      return {
        gameId: game.id,
        playerId: player.playerId,
        teamId: player.teamId,
      };
    });

    const modifiedPlayers = await modifyPlayers(repositoryRequest);

    return modifiedPlayers;
  };

  return {
    updatePlayers,
  };
};
