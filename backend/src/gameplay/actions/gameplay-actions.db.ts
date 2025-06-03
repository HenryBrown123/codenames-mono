import type { Kysely, Transaction } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import type { GameplayStateProvider } from "../state/gameplay-state.provider";

/**
 * Database context that could be a regular connection or transaction..
 */
export type DbContext = Kysely<DB> | Transaction<DB>;

/**
 * Repository functions for querying gameplay state
 */
export type GameplayQueryRepositories = {
  getCurrentState: (dbContext: DbContext) => GameplayStateProvider;
  getRandomWords: (dbContext: DbContext) => cardsRepository.RandomWordsSelector;
};

/**
 * Repository functions for performing gameplay commands
 */
export type GameplayCommandRepositories = {
  createRound: (dbContext: DbContext) => roundsRepository.RoundCreator;
  createCards: (dbContext: DbContext) => cardsRepository.CardsCreator;
  updateRoundStatus: (
    dbContext: DbContext,
  ) => roundsRepository.RoundStatusUpdater;
};

/**
 * Complete set of transactional repositories for gameplay operations
 */
export type TransactionalRepositories = GameplayQueryRepositories &
  GameplayCommandRepositories;
