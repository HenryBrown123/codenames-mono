import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import { complexProperties } from "../state/gameplay-state.helpers";
import { validateGuessCard, validateMakeGuess } from "./make-guess.rules";
import { getGuessOutcomeHandler } from "./guess-outcomes";

export type MakeGuessInput = {
  gameId: string;
  roundNumber: number;
  userId: number;
  cardWord: string;
};

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
  transition?: {
    type: "TURN_END" | "ROUND_END";
    nextTeam?: string;
    winner?: string;
    reason: string;
  } | null;
};

export const MAKE_GUESS_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  INVALID_CARD: "invalid-card",
  GAME_NOT_FOUND: "game-not-found",
  ROUND_NOT_FOUND: "round-not-found",
  ROUND_NOT_CURRENT: "round-not-current",
} as const;

export type MakeGuessResult =
  | { success: true; data: MakeGuessSuccess }
  | { success: false; error: any };

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

    // Validate round
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

    // Validate card
    const cardValidation = validateGuessCard(gameData, input.cardWord);
    if (!cardValidation.valid) {
      return {
        success: false,
        error: {
          status: MAKE_GUESS_ERROR.INVALID_CARD,
          cardWord: input.cardWord,
          reason: cardValidation.error!,
        },
      };
    }

    // Validate game state for making guess
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

      // 1. Make the guess - action handles all guess logic
      const guessResult = await ops.makeGuess(
        validationResult.data,
        cardValidation.cardId!,
      );

      // 2. Determine outcome and execute appropriate handler
      const handleOutcome = getGuessOutcomeHandler(
        guessResult.outcome,
        guessResult.shouldContinue,
        validationResult.data,
      );

      const transition = await handleOutcome({
        gameState: validationResult.data,
        currentTurn,
        ops,
      });

      return { guessResult, transition };
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
        transition: result.transition,
      },
    };
  };
};

export type MakeGuessService = ReturnType<typeof makeGuessService>;
