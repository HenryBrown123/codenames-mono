import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import * as gameRepository from "@backend/common/data-access/repositories/games.repository";
import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as playerRepository from "@backend/common/data-access/repositories/players.repository";
import * as teamsRepository from "@backend/common/data-access/repositories/teams.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import * as turnsRepository from "@backend/common/data-access/repositories/turns.repository";

import { lobbyStateProvider } from "./lobby-state.provider";

/**
 * Creates a gameplay state provider with the given database context
 * Works with both regular db connections and transaction contexts
 *
 * @param dbContext - Database connection or transaction context
 * @returns Gameplay state provider that uses the given context
 */
export const createLobbyStateProvider = (dbContext: Kysely<DB>) => {
  return lobbyStateProvider(
    gameRepository.findGameByPublicId(dbContext),
    teamsRepository.getTeamsByGameId(dbContext),
    playerRepository.findPlayersByGameId(dbContext),
    roundsRepository.getRoundsByGameId(dbContext),
  );
};

export type LobbyStateProvider = ReturnType<typeof createLobbyStateProvider>;

/**
 * Creates gameplay state components with all repository dependencies pre-wired
 *
 * @param dbContext - Database connection or transaction context
 * @returns Object containing configured state components
 */
export const lobbyState = (dbContext: Kysely<DB>) => {
  return {
    provider: createLobbyStateProvider(dbContext),
  };
};
