import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TurnStateProvider } from "@backend/common/state/turn-state.provider";
import type { GameplayValidationError } from "@backend/common/state/gameplay-state.validation";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";
import { complexProperties } from "@backend/common/state/gameplay-state.helpers";
import { GameEventsEmitter } from "@backend/common/websocket";

import { validateClueWord, validate as checkClueGivingRules } from "./give-clue.rules";

/**
 * Input parameters for giving a clue
 */
export type GiveClueInput = {
  gameId: string;
  roundNumber: number;
  userId: number;
  playerId: string;
  word: string;
  targetCardCount: number;
};

/**
 * Complete turn data that matches frontend TurnData interface
 */
export type CompleteTurnData = {
  id: string;
  teamName: string;
  status: "ACTIVE" | "COMPLETED";
  guessesRemaining: number;
  createdAt: Date;
  completedAt?: Date | null;
  clue?: {
    word: string;
    number: number;
    createdAt: Date;
  };
  hasGuesses: boolean;
  lastGuess?: {
    cardWord: string;
    playerName: string;
    outcome: string | null;
    createdAt: Date;
  };
  prevGuesses: {
    cardWord: string;
    playerName: string;
    outcome: string | null;
    createdAt: Date;
  }[];
};

/**
 * Successful clue result with complete turn data
 */
export type GiveClueSuccess = {
  clue: {
    word: string;
    targetCardCount: number;
    createdAt: Date;
  };
  turn: CompleteTurnData;
};

/**
 * Clue giving error types
 */
export const GIVE_CLUE_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  INVALID_CLUE_WORD: "invalid-clue-word",
  GAME_NOT_FOUND: "game-not-found",
  USER_NOT_PLAYER: "user-not-player",
  PLAYER_NOT_FOUND: "player-not-found",
  PLAYER_NOT_IN_GAME: "player-not-in-game",
  ROUND_NOT_FOUND: "round-not-found",
  ROUND_NOT_CURRENT: "round-not-current",
} as const;

/**
 * Clue giving failure details
 */
export type GiveClueFailure =
  | {
      status: typeof GIVE_CLUE_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof GIVE_CLUE_ERROR.INVALID_CLUE_WORD;
      word: string;
      reason: string;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.USER_NOT_PLAYER;
      gameId: string;
      userId: number;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.PLAYER_NOT_FOUND;
      playerId: string;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.PLAYER_NOT_IN_GAME;
      playerId: string;
      gameId: string;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.ROUND_NOT_FOUND;
      roundNumber: number;
    }
  | {
      status: typeof GIVE_CLUE_ERROR.ROUND_NOT_CURRENT;
      requestedRound: number;
      currentRound: number;
    };

/**
 * Combined result type for clue giving
 */
export type GiveClueResult =
  | { success: true; data: GiveClueSuccess }
  | { success: false; error: GiveClueFailure };

/**
 * Dependencies required by the give clue service
 */
export type GiveClueDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
  getTurnState: TurnStateProvider;
};

/**
 * Creates a service for handling clue giving with business rule validation
 */
export const giveClueService = (logger: AppLogger) => (dependencies: GiveClueDependencies) => {
  /**
   * Helper to get complete turn data for API response
   */
  const getCompleteTurnData = async (turnPublicId: string): Promise<CompleteTurnData> => {
    const turnData = await dependencies.getTurnState(turnPublicId);
    if (!turnData) {
      throw new Error(`Failed to fetch turn data for ${turnPublicId}`);
    }

    return {
      id: turnData.publicId,
      teamName: turnData.teamName,
      status: turnData.status,
      guessesRemaining: turnData.guessesRemaining,
      createdAt: turnData.createdAt,
      completedAt: turnData.completedAt,
      clue: turnData.clue,
      hasGuesses: turnData.hasGuesses,
      lastGuess: turnData.lastGuess,
      prevGuesses: turnData.prevGuesses,
    };
  };

  return async (input: GiveClueInput): Promise<GiveClueResult> => {
    const log = logger.for({}).withMeta({ gameId: input.gameId, userId: input.userId }).create();
    log.info(`giveClue called: ${JSON.stringify(input)}`);

    const result = await dependencies.getGameState(input.gameId, input.userId, input.playerId);

    if (result.status === "game-not-found") {
      log.warn(`giveClue failed: game not found`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    if (result.status === "user-not-player") {
      log.warn(`giveClue failed: user not player`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.USER_NOT_PLAYER,
          gameId: input.gameId,
          userId: input.userId,
        },
      };
    }

    if (result.status === "player-not-found") {
      log.warn(`giveClue failed: player not found`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.PLAYER_NOT_FOUND,
          playerId: input.playerId,
        },
      };
    }

    if (result.status === "player-not-in-game") {
      log.warn(`giveClue failed: player not in game`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.PLAYER_NOT_IN_GAME,
          playerId: input.playerId,
          gameId: input.gameId,
        },
      };
    }

    if (result.status === "user-not-authorized") {
      log.warn(`giveClue failed: user not authorized`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.USER_NOT_PLAYER,
          gameId: input.gameId,
          userId: input.userId,
        },
      };
    }

    // result.status === 'found' (all other cases handled above)
    const gameData = result.data;

    if (!gameData.currentRound) {
      log.warn(`giveClue failed: round not found`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.ROUND_NOT_FOUND,
          roundNumber: input.roundNumber,
        },
      };
    }

    if (gameData.currentRound.number !== input.roundNumber) {
      log.warn(`giveClue failed: round mismatch (requested=${input.roundNumber}, current=${gameData.currentRound.number})`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.ROUND_NOT_CURRENT,
          requestedRound: input.roundNumber,
          currentRound: gameData.currentRound.number,
        },
      };
    }

    const clueWordValidation = validateClueWord(gameData, input.word);
    if (!clueWordValidation.valid) {
      log.warn(`giveClue failed: invalid clue word (${clueWordValidation.error})`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.INVALID_CLUE_WORD,
          word: input.word,
          reason: clueWordValidation.error!,
        },
      };
    }

    const validationResult = checkClueGivingRules(gameData);

    if (!validationResult.valid) {
      log.warn(`giveClue failed: invalid game state (${gameData.status})`);
      return {
        success: false,
        error: {
          status: GIVE_CLUE_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    const operationResult = await dependencies.gameplayHandler(async (ops) => {
      return await ops.giveClue(validationResult.data, input.word, input.targetCardCount);
    });

    // ← CRITICAL FIX: Fetch complete turn data after transaction completes
    const currentTurn = complexProperties.getCurrentTurnOrThrow(gameData);
    const completeTurnData = await getCompleteTurnData(currentTurn.publicId);

    // Emit WebSocket event for real-time multiplayer updates
    GameEventsEmitter.clueGiven(
      input.gameId,
      input.roundNumber,
      currentTurn.publicId,
      input.playerId,
    );

    log.info(`giveClue success: word=${input.word}, count=${input.targetCardCount}`);
    return {
      success: true,
      data: {
        clue: {
          word: operationResult.clue.word,
          targetCardCount: operationResult.clue.number,
          createdAt: operationResult.clue.createdAt,
        },
        turn: completeTurnData,
      },
    };
  };
};

export type GiveClueService = ReturnType<ReturnType<typeof giveClueService>>;
