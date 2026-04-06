import { Kysely } from "kysely";
import { DB } from "@backend/shared/db/db.types";

import * as gameRepository from "@backend/shared/data-access/repositories/games.repository";
import * as roundsRepository from "@backend/shared/data-access/repositories/rounds.repository";
import * as playerRepository from "@backend/shared/data-access/repositories/players.repository";
import * as teamsRepository from "@backend/shared/data-access/repositories/teams.repository";
import * as cardsRepository from "@backend/shared/data-access/repositories/cards.repository";
import * as turnsRepository from "@backend/shared/data-access/repositories/turns.repository";

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
    cardsRepository.getCardsByRoundId(dbContext),
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
