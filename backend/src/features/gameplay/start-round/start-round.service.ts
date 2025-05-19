import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import type { StartRoundValidGameState } from "./start-round.rules";
import type { PublicId } from "@backend/common/data-access/games.repository";

import { validate as checkRoundStartRules } from "./start-round.rules";

/**
 * Basic input required to start a round
 */
export type StartRoundInput = {
  gameId: PublicId;
  roundNumber: number;
  userId: number;
};

/**
 * Represents the successful start of a round
 */
export type StartRoundSuccess = {
  roundNumber: number;
  status: string;
};

/**
 * Enumeration of possible errors that can occur during round start
 */
export const START_ROUND_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
  ROUND_NOT_FOUND: "round-not-found",
} as const;

/**
 * Represents various failure scenarios when starting a round
 */
export type StartRoundFailure =
  | {
      status: typeof START_ROUND_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof START_ROUND_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof START_ROUND_ERROR.ROUND_NOT_FOUND;
      roundNumber: number;
    };

/**
 * The complete result of attempting to start a round
 */
export type StartRoundResult =
  | { success: true; data: StartRoundSuccess }
  | { success: false; error: StartRoundFailure };

/**
 * Type for the action that updates a round's status
 */
export type StartRoundAction = (
  gameState: StartRoundValidGameState,
) => Promise<{
  roundNumber: number;
  status: string;
}>;

/**
 * External dependencies required by the start round service
 */
export type StartRoundDependencies = {
  getGameState: GameplayStateProvider;
  startRoundFromValidState: StartRoundAction;
};

/**
 * Creates a service for managing round start in a game
 */
export const startRoundService = (dependencies: StartRoundDependencies) => {
  /**
   * Attempts to start a round in a game
   *
   * @throws Never - Errors are returned in the result object
   */
  return async (input: StartRoundInput): Promise<StartRoundResult> => {
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

    if (!gameData) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    if (!gameData.currentRound) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.ROUND_NOT_FOUND,
          roundNumber: input.roundNumber,
        },
      };
    }

    if (gameData.currentRound.number !== input.roundNumber) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.INVALID_GAME_STATE,
          currentState: JSON.stringify(gameData),
          validationErrors: [],
        },
      };
    }

    const validationResult = checkRoundStartRules(gameData);

    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    // Since validation passed, we have a StartRoundValidGameState
    // Pass the validated game state to our action
    const updatedRound = await dependencies.startRoundFromValidState(
      validationResult.data,
    );

    return {
      success: true,
      data: {
        roundNumber: updatedRound.roundNumber,
        status: updatedRound.status,
      },
    };
  };
};

/**
 * Type representing an initialized round start service
 * Use this when you need to pass the service as a dependency
 */
export type StartRoundService = ReturnType<typeof startRoundService>;
