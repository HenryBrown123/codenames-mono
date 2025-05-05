import { gameplayStateProvider } from "../state/gameplay-state.provider";
import { validate } from "./new-round.rules";
import { createNextRound } from "./new-round.action";

import { UnexpectedGameplayError } from "../errors/gameplay.errors";
import { GameplayValidationError } from "../state/validate-gameplay-state";
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
  createRoundFromValidState: ReturnType<typeof createNextRound>;
};

/**
 * Creates a service function for round creation
 * Uses the validate-then-act pattern with branded types for type safety
 */
export const roundCreationService = (
  dependencies: RoundCreationDependencies,
) => {
  return async (input: RoundCreationInput): Promise<RoundCreationResult> => {
    try {
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

      // Validate game state for round creation - this returns a branded type when valid
      const validationResult = validate(gameData);

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
          roundId: newRound.id,
          roundNumber: newRound.roundNumber,
          gameId: newRound.gameId,
          createdAt: newRound.createdAt,
        },
      };
    } catch (error) {
      // Wrap unexpected errors
      throw new UnexpectedGameplayError("Failed to create new round", {
        cause: error,
      });
    }
  };
};

/**
 * Type of the service function
 */
export type RoundCreationService = ReturnType<typeof roundCreationService>;
