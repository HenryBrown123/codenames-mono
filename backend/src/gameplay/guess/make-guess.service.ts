import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import { CODEBREAKER_OUTCOME } from "@codenames/shared/types";
import { complexProperties } from "../state/gameplay-state.helpers";
import { validateMakeGuess, winningConditions } from "./make-guess.rules";

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
  /**
   * Handles correct team card outcome
   */
  const handleCorrectTeamCard = async (
    ops: GameplayOperations,
    guessResult: any,
    input: MakeGuessInput,
  ) => {
    const gameState = await ops.getCurrentGameState(input.gameId, input.userId);
    const otherTeamId = complexProperties.getOtherTeamId(
      gameState,
      guessResult.turn._teamId,
    );

    const roundWinner = winningConditions.checkRoundWinner(
      gameState.currentRound!.cards,
      guessResult.turn._teamId,
      otherTeamId,
    );

    if (roundWinner) {
      await ops.endTurn(gameState, guessResult.turn._id);

      const stateAfterTurnEnd = await ops.getCurrentGameState(
        input.gameId,
        input.userId,
      );
      await ops.endRound(
        stateAfterTurnEnd,
        stateAfterTurnEnd.currentRound!._id,
        roundWinner,
      );

      const updatedGameState = await ops.getCurrentGameState(
        input.gameId,
        input.userId,
      );
      const gameWinner = winningConditions.checkGameWinner(
        updatedGameState.historicalRounds,
        updatedGameState.game_format,
      );
      if (gameWinner) {
        await ops.endGame(updatedGameState, gameWinner);
      }
    } else if (guessResult.turn.guessesRemaining === 0) {
      await ops.endTurn(gameState, guessResult.turn._id);

      const updatedGameState = await ops.getCurrentGameState(
        input.gameId,
        input.userId,
      );
      await ops.startTurn(
        updatedGameState,
        updatedGameState.currentRound!._id,
        otherTeamId,
      );
    }

    return await ops.getCurrentGameState(input.gameId, input.userId);
  };

  /**
   * Handles wrong team card outcome
   */
  const handleWrongTeamCard = async (
    ops: GameplayOperations,
    guessResult: any,
    input: MakeGuessInput,
  ) => {
    const gameState = await ops.getCurrentGameState(input.gameId, input.userId);
    await ops.endTurn(gameState, guessResult.turn._id);

    const updatedGameState = await ops.getCurrentGameState(
      input.gameId,
      input.userId,
    );
    const otherTeamId = complexProperties.getOtherTeamId(
      updatedGameState,
      guessResult.turn._teamId,
    );

    const roundWinner = winningConditions.checkRoundWinner(
      updatedGameState.currentRound!.cards,
      guessResult.turn._teamId,
      otherTeamId,
    );

    if (roundWinner) {
      await ops.endRound(
        updatedGameState,
        updatedGameState.currentRound!._id,
        roundWinner,
      );

      const stateAfterRoundEnd = await ops.getCurrentGameState(
        input.gameId,
        input.userId,
      );
      const gameWinner = winningConditions.checkGameWinner(
        stateAfterRoundEnd.historicalRounds,
        stateAfterRoundEnd.game_format,
      );
      if (gameWinner) {
        await ops.endGame(stateAfterRoundEnd, gameWinner);
      }
    } else {
      await ops.startTurn(
        updatedGameState,
        updatedGameState.currentRound!._id,
        otherTeamId,
      );
    }

    return await ops.getCurrentGameState(input.gameId, input.userId);
  };

  /**
   * Handles bystander card outcome
   */
  const handleBystanderCard = async (
    ops: GameplayOperations,
    guessResult: any,
    input: MakeGuessInput,
  ) => {
    const gameState = await ops.getCurrentGameState(input.gameId, input.userId);
    await ops.endTurn(gameState, guessResult.turn._id);

    const updatedGameState = await ops.getCurrentGameState(
      input.gameId,
      input.userId,
    );
    const otherTeamId = complexProperties.getOtherTeamId(
      updatedGameState,
      guessResult.turn._teamId,
    );
    await ops.startTurn(
      updatedGameState,
      updatedGameState.currentRound!._id,
      otherTeamId,
    );

    return await ops.getCurrentGameState(input.gameId, input.userId);
  };

  /**
   * Handles assassin card outcome - other team wins immediately
   */
  const handleAssassinCard = async (
    ops: GameplayOperations,
    guessResult: any,
    input: MakeGuessInput,
  ) => {
    const gameState = await ops.getCurrentGameState(input.gameId, input.userId);
    await ops.endTurn(gameState, guessResult.turn._id);

    const updatedGameState = await ops.getCurrentGameState(
      input.gameId,
      input.userId,
    );
    const otherTeamId = complexProperties.getOtherTeamId(
      updatedGameState,
      guessResult.turn._teamId,
    );
    await ops.endRound(
      updatedGameState,
      updatedGameState.currentRound!._id,
      otherTeamId,
    );

    const stateAfterRoundEnd = await ops.getCurrentGameState(
      input.gameId,
      input.userId,
    );
    const gameWinner = winningConditions.checkGameWinner(
      stateAfterRoundEnd.historicalRounds,
      stateAfterRoundEnd.game_format,
    );
    if (gameWinner) {
      await ops.endGame(stateAfterRoundEnd, gameWinner);
    }

    return await ops.getCurrentGameState(input.gameId, input.userId);
  };

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
      // Make the guess
      const guessResult = await ops.makeGuess(
        validationResult.data,
        input.cardWord,
      );

      // Handle outcome with appropriate game progression
      let finalGameState;
      switch (guessResult.outcome) {
        case CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD:
          finalGameState = await handleCorrectTeamCard(ops, guessResult, input);
          break;
        case CODEBREAKER_OUTCOME.OTHER_TEAM_CARD:
          finalGameState = await handleWrongTeamCard(ops, guessResult, input);
          break;
        case CODEBREAKER_OUTCOME.BYSTANDER_CARD:
          finalGameState = await handleBystanderCard(ops, guessResult, input);
          break;
        case CODEBREAKER_OUTCOME.ASSASSIN_CARD:
          finalGameState = await handleAssassinCard(ops, guessResult, input);
          break;
        default:
          throw new Error(`Unknown outcome: ${guessResult.outcome}`);
      }

      return { guessResult };
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
      },
    };
  };
};

export type MakeGuessService = ReturnType<typeof makeGuessService>;
