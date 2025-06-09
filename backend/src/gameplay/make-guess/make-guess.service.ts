import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import { complexProperties } from "../state/gameplay-state.helpers";
import { validateMakeGuess } from "./make-guess.rules";
import { getGuessOutcomeHandler } from "./guess-outcomes";

/**
 * Input parameters for making a guess
 */
export type MakeGuessInput = {
  gameId: string;
  roundNumber: number;
  userId: number;
  cardWord: string;
};

/**
 * Successful guess result
 */
export type MakeGuessSuccess = {
  guess: {
    cardWord: string;
    outcome: string;
    createdAt: Date;
  };
  turn: {
    teamName: string;
    guessesRemaining: number;
    status: string;
  };
  gameState: any; // The updated game state after all transitions
};

/**
 * Guess error types
 */
export const MAKE_GUESS_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  INVALID_CARD: "invalid-card",
  GAME_NOT_FOUND: "game-not-found",
  ROUND_NOT_FOUND: "round-not-found",
  ROUND_NOT_CURRENT: "round-not-current",
} as const;

/**
 * Guess failure details
 */
export type MakeGuessFailure =
  | {
      status: typeof MAKE_GUESS_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: any[];
    }
  | {
      status: typeof MAKE_GUESS_ERROR.INVALID_CARD;
      cardWord: string;
      reason: string;
    }
  | {
      status: typeof MAKE_GUESS_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof MAKE_GUESS_ERROR.ROUND_NOT_FOUND;
      roundNumber: number;
    }
  | {
      status: typeof MAKE_GUESS_ERROR.ROUND_NOT_CURRENT;
      requestedRound: number;
      currentRound: number;
    };

/**
 * Combined result type for guess making
 */
export type MakeGuessResult =
  | { success: true; data: MakeGuessSuccess }
  | { success: false; error: MakeGuessFailure };

/**
 * Dependencies required by the make guess service
 */
export type MakeGuessDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
};

/**
 * Creates the make guess service
 */
export const makeGuessService = (dependencies: MakeGuessDependencies) => {
  return async (input: MakeGuessInput): Promise<MakeGuessResult> => {
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

    if (!gameData) {
      return {
        success: false,
        error: {
          status: MAKE_GUESS_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Validate round exists and is current
    if (!gameData.currentRound) {
      return {
        success: false,
        error: {
          status: MAKE_GUESS_ERROR.ROUND_NOT_FOUND,
          roundNumber: input.roundNumber,
        },
      };
    }

    if (gameData.currentRound.number !== input.roundNumber) {
      return {
        success: false,
        error: {
          status: MAKE_GUESS_ERROR.ROUND_NOT_CURRENT,
          requestedRound: input.roundNumber,
          currentRound: gameData.currentRound.number,
        },
      };
    }

    // Validate game state for making guess (before transaction)
    const validationResult = validateMakeGuess(gameData);
    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: MAKE_GUESS_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    // Execute within transaction
    const result = await dependencies.gameplayHandler(async (ops) => {
      const currentTurn = complexProperties.getCurrentTurnOrThrow(gameData);

      // 1. Make the guess - action handles validation and guess logic
      const guessResult = await ops.makeGuess(
        validationResult.data,
        input.cardWord,
      );

      // 2. Handle outcome with appropriate transitions
      const outcomeHandler = getGuessOutcomeHandler(guessResult.outcome);
      const finalGameState = await outcomeHandler({
        currentTurn,
        ops,
        gameId: input.gameId,
        userId: input.userId,
      });

      return { guessResult, finalGameState };
    });

    return {
      success: true,
      data: {
        guess: {
          cardWord: input.cardWord,
          outcome: result.guessResult.outcome,
          createdAt: result.guessResult.createdAt,
        },
        turn: {
          teamName: result.guessResult.turn.teamName,
          guessesRemaining: result.guessResult.turn.guessesRemaining,
          status: result.guessResult.turn.status,
        },
        gameState: result.finalGameState,
      },
    };
  };
};

export type MakeGuessService = ReturnType<typeof makeGuessService>;
