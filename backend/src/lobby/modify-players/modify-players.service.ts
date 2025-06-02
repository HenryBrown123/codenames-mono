import { UnexpectedLobbyError } from "../errors/lobby.errors";
import { PlayersUpdater } from "@backend/common/data-access/players.repository";
import {
  GameFinder,
  PublicId,
} from "@backend/common/data-access/games.repository";

/**
 * Represents the result of a player modification operation
 */
export type PlayerResult = {
  publicId: string;
  playerName: string;
  username?: string;
  teamName: string;
  statusId: number;
};

/**
 * Data structure for updating player information
 */
export type PlayerUpdateData = {
  playerId: string;
  playerName?: string;
  teamName?: string;
}[];

/**
 * Service response including game context
 */
export type ModifyPlayersServiceResult = {
  modifiedPlayers: PlayerResult[];
  gamePublicId: string;
};

/**
 * Service interface for modifying player data
 */
export interface ModifyPlayersService {
  /**
   * Updates multiple players with new information
   * @param publicGameId - Public identifier for the game
   * @param playersToModify - Array of player data to update
   * @returns Promise resolving to array of updated player results and game context
   */
  updatePlayers: (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ) => Promise<ModifyPlayersServiceResult>;
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
   * @returns Promise resolving to array of updated player results and game context
   * @throws {UnexpectedLobbyError} If the game does not exist
   */
  const updatePlayers = async (
    publicGameId: string,
    playersToModify: PlayerUpdateData,
  ): Promise<ModifyPlayersServiceResult> => {
    if (!playersToModify.length) {
      return { modifiedPlayers: [], gamePublicId: publicGameId };
    }

    const game = await getGameByPublicId(publicGameId);

    if (!game) {
      throw new UnexpectedLobbyError(
        "Failed to modify players... game does not exist",
      );
    }

    // TODO: Need to implement team name to team ID lookup
    // For now, this will need repository layer changes to handle team names
    const repositoryRequest = playersToModify.map((player) => {
      return {
        gameId: game._id,
        publicPlayerId: player.playerId,
        publicName: player.playerName,
        // teamId: player.teamId, // TODO: Convert teamName to teamId
      };
    });

    const modifiedPlayers = await modifyPlayers(repositoryRequest);

    return {
      modifiedPlayers: modifiedPlayers.map((player) => ({
        publicId: player.publicId,
        playerName: player.publicName,
        username: undefined, // Could be enriched with user data if needed
        teamName: player.teamName,
        statusId: player.statusId,
      })),
      gamePublicId: game.public_id,
    };
  };

  return {
    updatePlayers,
  };
};
