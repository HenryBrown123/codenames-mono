import { gameplayStateProvider } from "../state/gameplay-state.provider";
import {
  validateForRoundCreation,
  GameplayValidationError,
} from "../state/validate-gameplay-state";

import {
  createNewRound,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";

import { NewRoundValidGameState } from "../state/validate-gameplay-state";

/**
 * Creates a function that accepts only a validated game state for round creation
 * Uses parameter destructuring to pick only the necessary properties
 */
export const createRoundFromGameplay = (
  createRoundRepo: ReturnType<typeof createNewRound>,
) => {
  return ({ id, rounds }: NewRoundValidGameState): Promise<RoundResult> => {
    const nextRoundNumber = (rounds?.length || 0) + 1;

    // Use the id from the validated state
    return createRoundRepo(id, nextRoundNumber);
  };
};
/**
 * Input type for round creation
 */
export type RoundCreationInput = {
  gameId: string;
  userId: number;
};

/**
 * Success case data structure
 */
export type RoundCreationSuccess = {
  roundId: number;
  roundNumber: number;
  gameId: number;
  createdAt: Date;
};

/**
 * Error codes for round creation
 */
export const ROUND_CREATION_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
} as const;

/**
 * Failure cases for round creation
 */
export type RoundCreationFailure =
  | {
      status: typeof ROUND_CREATION_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof ROUND_CREATION_ERROR.GAME_NOT_FOUND;
      gameId: string;
    };

/**
 * Result types for round creation with discriminated union
 */
export type RoundCreationResult =
  | { success: true; data: RoundCreationSuccess }
  | { success: false; error: RoundCreationFailure };

/**
 * Dependencies for the round creation service
 */
export type RoundCreationDependencies = {
  getGameState: ReturnType<typeof gameplayStateProvider>;
  createRoundFromValidState: ReturnType<typeof createRoundFromGameplay>;
};

/**
 * Creates a service for round creation
 */
export const roundCreationService = (
  dependencies: RoundCreationDependencies,
) => {
  /**
   * Creates a new round for a game if validation passes
   */
  const createRound = async (
    input: RoundCreationInput,
  ): Promise<RoundCreationResult> => {
    // Fetch game with rounds
    const gameData = await dependencies.getGameState(input.gameId);

    if (!gameData) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Validate game state
    const validationResult = validateForRoundCreation(gameData);

    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    // Game validation passed, create the new round with the validated state
    const newRound = await dependencies.createRoundFromValidState(
      validationResult.data,
    );

    // Return success result
    return {
      success: true,
      data: {
        roundId: newRound.id,
        roundNumber: newRound.roundNumber,
        gameId: newRound.gameId,
        createdAt: newRound.createdAt,
      },
    };
  };

  return createRound;
};

/**
 * Type of the service function
 */
export type RoundCreationService = ReturnType<typeof roundCreationService>;
