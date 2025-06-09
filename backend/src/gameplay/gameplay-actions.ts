import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import {
  createTransactionalHandler,
  TransactionContext,
} from "@backend/common/data-access/transaction-handler";

import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import * as playerRepository from "@backend/common/data-access/repositories/players.repository";
import * as turnRepository from "@backend/common/data-access/repositories/turns.repository";

import { gameplayState } from "./state";
import { createNextRound } from "./new-round/new-round.actions";
import { dealCardsToRound } from "./deal-cards/deal-cards.actions";
import { startCurrentRound } from "./start-round/start-round.actions";
import { assignRolesRandomly } from "./assign-roles/assign-roles.actions";
import { giveClueToTurn } from "./give-clue/give-clue.actions";
import {
  createMakeGuessAction,
  createEndTurnAction,
  createStartTurnAction,
  createEndRoundAction,
} from "./make-guess/make-guess.actions";
import {
  validateMakeGuess,
  validateEndTurn,
  validateStartTurn,
  validateEndRound,
} from "./make-guess/make-guess.rules";

import { UnexpectedGameplayError } from "./errors/gameplay.errors";

/**
 * Wrapper around gameplay state provider to throw if not found
 */
const getGameStateOrThrow =
  (trx: TransactionContext) => async (gameId: string, userId: number) => {
    const game = await gameplayState(trx).provider(gameId, userId);

    if (!game) throw new UnexpectedGameplayError("Game not found");

    return game;
  };

/**
 * Creates gameplay operations for use within a transaction context
 */
export const gameplayOperations = (trx: TransactionContext) => ({
  /** round management */
  createRound: createNextRound(roundsRepository.createNewRound(trx)),
  assignPlayerRoles: assignRolesRandomly(
    playerRepository.assignPlayerRoles(trx),
    (gameId: number) =>
      playerRepository.getRoleHistory(trx)(gameId, "CODEMASTER"),
  ),
  dealCards: dealCardsToRound(
    cardsRepository.getRandomWords(trx),
    cardsRepository.replaceCards(trx),
  ),
  startRound: startCurrentRound(roundsRepository.updateRoundStatus(trx)),

  /** codemaster moves */
  giveClue: giveClueToTurn(
    turnRepository.createClue(trx),
    turnRepository.updateTurnGuesses(trx),
  ),

  /** codebreaker moves */
  makeGuess: createMakeGuessAction({
    updateCards: cardsRepository.updateCards(trx),
    createGuess: turnRepository.createGuess(trx),
    updateTurnGuesses: turnRepository.updateTurnGuesses(trx),
    validateMakeGuess,
  }),

  /** turn/round transitions */
  endTurn: createEndTurnAction({
    updateTurnStatus: turnRepository.updateTurnStatus(trx),
    validateEndTurn,
  }),

  startTurn: createStartTurnAction({
    createTurn: turnRepository.createTurn(trx),
    validateStartTurn,
  }),

  endRound: createEndRoundAction({
    updateRoundStatus: roundsRepository.updateRoundStatus(trx),
    updateRoundWinner: roundsRepository.updateRoundWinner(trx),
    validateEndRound,
  }),

  /** TODO: Add endGame action when you implement it */
  endGame: async (gameState: any, winningTeamId: number) => {
    // Placeholder - implement when you add game completion
    console.log(`Game ended, winner: ${winningTeamId}`);
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
