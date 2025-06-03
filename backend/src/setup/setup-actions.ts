import type { TransactionContext } from "@backend/common/data-access/transaction-handler";
import * as gamesRepository from "@backend/common/data-access/repositories/games.repository";
import * as teamsRepository from "@backend/common/data-access/repositories/teams.repository";

/**
 * Creates setup operations for use within a transaction context
 *
 * @param trx - Database transaction context
 * @returns Object containing all setup operations
 */
export const setupOperations = (trx: TransactionContext) => ({
  getGame: gamesRepository.findGameByPublicId(trx),
  createGame: gamesRepository.createGame(trx),
  createTeams: teamsRepository.createTeams(trx),
});

/**
 * Type representing all operations available within setup transactions
 */
export type SetupOperations = ReturnType<typeof setupOperations>;
