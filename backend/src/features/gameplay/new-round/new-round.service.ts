import { getGameDataByPublicId } from "@backend/common/data-access/games.repository";
import {
  getLatestRound,
  createRound,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";
import { UnexpectedGameplayError } from "../errors/gameplay.errors";
import { GameData } from "@backend/common/data-access/games.repository";

/**
 * Service dependencies
 */
export type ServiceDependencies = {
  getGameByPublicId: ReturnType<typeof getGameDataByPublicId>;
  getLatestRound: ReturnType<typeof getLatestRound>;
  createRound: ReturnType<typeof createRound>;
};

/**
 * Result of round creation
 */
export type CreateRoundResult = {
  id: number;
  gameId: number;
  roundNumber: number;
  createdAt: Date;
};

/**
 * Validates if a game is ready for a new round to be created
 *
 * @param game - Current game data
 * @param previousRound - Most recent round for the game, if any
 * @throws {UnexpectedGameplayError} If conditions aren't met for round creation
 */
export const validateGameReadyForRound = (
  game: GameData,
  previousRound: RoundResult | null,
): void => {
  if (game.status !== "IN_PROGRESS") {
    throw new UnexpectedGameplayError(
      `Cannot create round for game in '${game.status}' state. Game must be in 'IN_PROGRESS' state.`,
    );
  }

  // If there's no latest round, we can always create a new round
  if (!previousRound) {
    return;
  }

  // Check if the latest round is completed
  // This depends on how you track round completion in your data model
  // For example:
  // if (latestRound.status !== "COMPLETED") {
  //   throw new UnexpectedGameplayError(
  //     "Cannot create a new round while the previous round is still in progress"
  //   );
  // }

  // Check if maximum rounds have been reached for game format
  // For example:
  // if (game.game_format === "BEST_OF_THREE" && latestRound.roundNumber >= 3) {
  //   throw new UnexpectedGameplayError("Maximum number of rounds already reached");
  // }
};

/**
 * Create round service
 *
 * Handles the creation of a new round for a game.
 * Starting team selection and card dealing are handled separately.
 */
export const createRoundService = (dependencies: ServiceDependencies) => {
  /**
   * Creates a new round for a game
   *
   * @param publicGameId - Public identifier for the game
   * @returns Details of the newly created round
   * @throws {UnexpectedGameplayError} If round creation is not possible
   */
  const createNewRound = async (
    publicGameId: string,
  ): Promise<CreateRoundResult> => {
    try {
      const game = await dependencies.getGameByPublicId(publicGameId);
      if (!game) {
        throw new UnexpectedGameplayError("Game not found");
      }
      const latestRound = await dependencies.getLatestRound(game.id);

      validateGameReadyForRound(game, latestRound);

      const newRoundNumber = latestRound ? latestRound.roundNumber + 1 : 1;

      const newRound = await dependencies.createRound({
        gameId: game.id,
        roundNumber: newRoundNumber,
      });

      // 5. Return result
      return {
        id: newRound.id,
        gameId: game.id,
        roundNumber: newRound.roundNumber,
        createdAt: newRound.createdAt,
      };
    } catch (error) {
      if (error instanceof UnexpectedGameplayError) {
        throw error;
      }
      throw new UnexpectedGameplayError(
        `Failed to create round: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return {
    createNewRound,
  };
};
