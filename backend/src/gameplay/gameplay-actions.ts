import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import {
  createTransactionalHandler,
  TransactionContext,
} from "@backend/common/data-access/transaction-handler";

import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";

import { gameplayState } from "./state";
import { createNextRound } from "./new-round/new-round.actions";
import { dealCardsToRound } from "./deal-cards/deal-cards.actions";
import { startCurrentRound } from "./start-round/start-round.actions";

/**
 * Creates gameplay operations for use within a transaction context
 *
 * @param trx - Database transaction context
 * @returns Object containing all gameplay operations
 */
export const gameplayOperations = (trx: TransactionContext) => ({
  createRound: createNextRound(roundsRepository.createNewRound(trx)),
  dealCards: dealCardsToRound(
    cardsRepository.getRandomWords(trx),
    cardsRepository.replaceCards(trx),
  ),
  startRound: startCurrentRound(roundsRepository.updateRoundStatus(trx)),
  getCurrentGameState: gameplayState(trx).provider,
});

/**
 * Type representing all operations available within gameplay transactions
 */
export type GameplayOperations = ReturnType<typeof gameplayOperations>;

/**
 * Creates gameplay action components with transactional handler
 *
 * @param dbContext - Database connection for transaction management
 * @returns Object containing configured action components
 */
export const gameplayActions = (dbContext: Kysely<DB>) => {
  return {
    handler: createTransactionalHandler(dbContext, gameplayOperations),
  };
};
