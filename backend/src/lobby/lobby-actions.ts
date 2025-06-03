import type { TransactionContext } from "@backend/common/data-access/transaction-handler";
import * as playersRepository from "@backend/common/data-access/repositories/players.repository";
import * as gamesRepository from "@backend/common/data-access/repositories/games.repository";
import { lobbyState } from "./state";

/**
 * Creates lobby operations for use within a transaction context
 *
 * @param trx - Database transaction context
 * @returns Object containing all lobby operations
 */
export const lobbyOperations = (trx: TransactionContext) => ({
  getLobbyState: lobbyState(trx).provider,
  addPlayers: playersRepository.addPlayers(trx),
  removePlayer: playersRepository.removePlayer(trx),
  modifyPlayers: playersRepository.modifyPlayers(trx),
  updateGameStatus: gamesRepository.updateGameStatus(trx),
});

/**
 * Type representing all operations available within lobby transactions
 */
export type LobbyOperations = ReturnType<typeof lobbyOperations>;
