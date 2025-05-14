import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";

import { validate as checkRoundCreationRules } from "./new-round.rules";
import { createNextRound } from "./new-round.actions";

/**
 * Basic input required to create a new round
 */
export type RoundCreationInput = {
  gameId: string;
  userId: number;
};

/**
 * Represents the successful creation of a new round
 */
export type RoundCreationSuccess = {
  _roundId: number;
  roundNumber: number;
  _gameId: number;
  createdAt: Date;
};

/**
 * Enumeration of possible errors that can occur during round creation
 */
export const ROUND_CREATION_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
} as const;

/**
 * Represents various failure scenarios when creating a new round
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
 * The complete result of attempting to create a new round
 */
export type RoundCreationResult =
  | { success: true; data: RoundCreationSuccess }
  | { success: false; error: RoundCreationFailure };

/**
 * External dependencies required by the round creation service
 */
export type RoundCreationDependencies = {
  getGameState: GameplayStateProvider;
  createRoundFromValidState: ReturnType<typeof createNextRound>;
};

/**
 * Creates a service for managing new round creation in a game
 *
 */
export const roundCreationService = (
  dependencies: RoundCreationDependencies,
) => {
  /**
   * Attempts to create a new round for a game
   *
   * @throws Never - Errors are returned in the result object or will bubble up.
   */
  return async (input: RoundCreationInput): Promise<RoundCreationResult> => {
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

    const validationResult = checkRoundCreationRules(gameData);

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

    const newRound = await dependencies.createRoundFromValidState(
      validationResult.data,
    );
    return {
      success: true,
      data: {
        _roundId: newRound._id,
        roundNumber: newRound.roundNumber,
        _gameId: newRound._gameId,
        createdAt: newRound.createdAt,
      },
    };
  };
};

/**
 * Type representing an initialized round creation service
 * Use this when you need to pass the service as a dependency
 */
export type RoundCreationService = ReturnType<typeof roundCreationService>;
