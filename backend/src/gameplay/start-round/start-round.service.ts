import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import type { TransactionalGameplayHandler } from "../actions/gameplay-actions.handler";

import { validate as checkRoundStartRules } from "./start-round.rules";

/**
 * Input parameters for starting a round
 */
export type StartRoundInput = {
  gameId: string;
  roundNumber: number;
  userId: number;
};

/**
 * Successful round start result
 */
export type StartRoundSuccess = {
  roundNumber: number;
  status: string;
};

/**
 * Round start error types
 */
export const START_ROUND_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
  ROUND_NOT_FOUND: "round-not-found",
} as const;

/**
 * Round start failure details
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
 * Combined result type for round start
 */
export type StartRoundResult =
  | { success: true; data: StartRoundSuccess }
  | { success: false; error: StartRoundFailure };

/**
 * Dependencies required by the start round service
 */
export type StartRoundDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalGameplayHandler;
};

/**
 * Creates a service for handling round start with business rule validation
 *
 * @param dependencies - Required external dependencies
 * @returns Service function for starting rounds
 */
export const startRoundService = (dependencies: StartRoundDependencies) => {
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

    const updatedRound = await dependencies.gameplayHandler(async (game) => {
      return await game.startRound(validationResult.data);
    });

    return {
      success: true,
      data: {
        roundNumber: updatedRound.roundNumber,
        status: updatedRound.status,
      },
    };
  };
};

export type StartRoundService = ReturnType<typeof startRoundService>;
