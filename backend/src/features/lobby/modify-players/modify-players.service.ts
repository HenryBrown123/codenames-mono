import { UnexpectedLobbyError } from "../errors/lobby.errors";
import { GameRepository } from "@backend/common/data-access/games.repository";
import { PlayerRepository } from "@backend/common/data-access/players.repository";

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
export interface Dependencies {
  playerRepository: PlayerRepository;
  gameRepository: GameRepository;
}

/**
 * Creates and returns an implementation of the ModifyPlayersService
 * @param dependencies - Required repositories for service operations
 * @returns Configured ModifyPlayersService instance
 */
export const create = ({
  playerRepository,
  gameRepository,
}: Dependencies): ModifyPlayersService => {
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

    const game = await gameRepository.getGameDataByPublicId(publicGameId);

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

    const modifiedPlayers =
      await playerRepository.modifyPlayers(repositoryRequest);

    return modifiedPlayers;
  };

  return {
    updatePlayers,
  };
};
