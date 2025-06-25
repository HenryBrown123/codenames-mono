import type { TransactionContext } from "@backend/common/data-access/transaction-handler";
import * as playersRepository from "@backend/common/data-access/repositories/players.repository";
import * as playerRolesRepository from "@backend/common/data-access/repositories/player-roles.repository";
import * as gamesRepository from "@backend/common/data-access/repositories/games.repository";
import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import * as turnRepository from "@backend/common/data-access/repositories/turns.repository";

import * as newRoundActions from "./new-round/new-round.actions";
import * as dealCardsActions from "./deal-cards/deal-cards.actions";
import * as startRoundActions from "./start-round/start-round.actions";
import * as assignRolesActions from "./assign-roles/assign-roles.actions";

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
  
  // Round management operations (moved from gameplay)
  createRound: newRoundActions.createNextRound(
    roundsRepository.createNewRound(trx),
  ),
  assignPlayerRoles: assignRolesActions.assignRolesRandomly(
    playerRolesRepository.assignPlayerRoles(trx),
    (gameId: number) =>
      playersRepository.getRoleHistory(trx)(gameId, "CODEMASTER"),
  ),
  dealCards: dealCardsActions.dealCardsToRound(
    cardsRepository.getRandomWords(trx),
    cardsRepository.replaceCards(trx),
  ),
  startRound: startRoundActions.startCurrentRound(
    roundsRepository.updateRoundStatus(trx),
    turnRepository.createTurn(trx),
  ),
});

/**
 * Type representing all operations available within lobby transactions
 */
export type LobbyOperations = ReturnType<typeof lobbyOperations>;
