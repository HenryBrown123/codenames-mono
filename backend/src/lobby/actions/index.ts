import {
  DbContext,
  createTransactionalHandler,
} from "@backend/common/data-access/transaction-handler";

import * as playersRepository from "@backend/common/data-access/repositories/players.repository";
import * as gamesRepository from "@backend/common/data-access/repositories/games.repository";

import { lobbyState } from "../state";

const createLobbyOperations = (trx: DbContext) => ({
  getLobbyState: lobbyState(trx).provider,
  addPlayers: playersRepository.addPlayers(trx),
  removePlayer: playersRepository.removePlayer(trx),
  modifyPlayers: playersRepository.modifyPlayers(trx),
  updateGameStatus: gamesRepository.updateGameStatus(trx),
});

export type LobbyOperations = ReturnType<typeof createLobbyOperations>;

export const lobbyActions = (db: DbContext) => {
  const lobbyHandler = createTransactionalHandler(db, createLobbyOperations);

  return {
    handler: lobbyHandler,
  };
};
