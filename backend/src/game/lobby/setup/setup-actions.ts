// backend/src/setup/setup-actions.ts
import type { TransactionContext } from "@backend/shared/data-access/transaction-handler";
import * as gamesRepository from "@backend/shared/data-access/repositories/games.repository";
import * as teamsRepository from "@backend/shared/data-access/repositories/teams.repository";
import * as playersRepository from "@backend/shared/data-access/repositories/players.repository";

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
  addPlayers: playersRepository.addPlayers(trx), // Add player creation capability
});

/**
 * Type representing all operations available within setup transactions
 */
export type SetupOperations = ReturnType<typeof setupOperations>;
