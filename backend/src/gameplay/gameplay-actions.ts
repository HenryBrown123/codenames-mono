import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import {
  createTransactionalHandler,
  TransactionContext,
} from "@backend/common/data-access/transaction-handler";

import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import * as turnRepository from "@backend/common/data-access/repositories/turns.repository";
import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as gameRepository from "@backend/common/data-access/repositories/games.repository";
import * as giveClueActions from "./give-clue/give-clue.actions";
import * as makeGuessActions from "./guess/make-guess.actions";
import * as makeGuessRules from "./guess/make-guess.rules";


import { gameplayState } from "./state";
import { UnexpectedGameplayError } from "./errors/gameplay.errors";

/**
 * Wrapper around gameplay state provider to throw if not found
 */
const getGameStateOrThrow =
  (trx: TransactionContext) => async (gameId: string, userId: number) => {
    const game = await gameplayState(trx).provider(gameId, userId);

    if (game.status !== "found")
      throw new UnexpectedGameplayError("Game not found");

    return game.data;
  };

/**
 * Creates gameplay operations for use within a transaction context
 */
export const gameplayOperations = (trx: TransactionContext) => ({
  /** codemaster moves */
  giveClue: giveClueActions.giveClueToTurn(
    turnRepository.createClue(trx),
    turnRepository.updateTurnGuesses(trx),
  ),

  /** codebreaker moves */
  makeGuess: makeGuessActions.createMakeGuessAction({
    updateCards: cardsRepository.updateCards(trx),
    createGuess: turnRepository.createGuess(trx),
    updateTurnGuesses: turnRepository.updateTurnGuesses(trx),
    validateMakeGuess: makeGuessRules.validateMakeGuess,
  }),

  /** turn/round transitions */
  endTurn: makeGuessActions.createEndTurnAction({
    updateTurnStatus: turnRepository.updateTurnStatus(trx),
    validateEndTurn: makeGuessRules.validateEndTurn,
  }),

  startTurn: makeGuessActions.createStartTurnAction({
    createTurn: turnRepository.createTurn(trx),
    validateStartTurn: makeGuessRules.validateStartTurn,
  }),

  endRound: makeGuessActions.createEndRoundAction({
    updateRoundStatus: roundsRepository.updateRoundStatus(trx),
    updateRoundWinner: roundsRepository.updateRoundWinner(trx),
    validateEndRound: makeGuessRules.validateEndRound,
  }),

  /** game completion */
  endGame: async (gameState: any, winningTeamId: number) => {
    makeGuessActions.createEndGameAction(gameRepository.updateGameStatus(trx))(
      gameState,
      winningTeamId,
    );
  },

  /** queries */
  getCurrentGameState: getGameStateOrThrow(trx),
});

/**
 * Type representing all operations available within gameplay transactions
 */
export type GameplayOperations = ReturnType<typeof gameplayOperations>;

/**
 * Creates gameplay action components with transactional handler
 */
export const gameplayActions = (dbContext: Kysely<DB>) => {
  return {
    handler: createTransactionalHandler(dbContext, gameplayOperations),
  };
};
