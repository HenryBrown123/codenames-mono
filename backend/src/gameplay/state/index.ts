import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import * as gameRepository from "@backend/common/data-access/games.repository";
import * as roundsRepository from "@backend/common/data-access/rounds.repository";
import * as playerRepository from "@backend/common/data-access/players.repository";
import * as teamsRepository from "@backend/common/data-access/teams.repository";
import * as cardsRepository from "@backend/common/data-access/cards.repository";
import * as turnsRepository from "@backend/common/data-access/turns.repository";

import { gameplayStateProvider } from "./gameplay-state.provider";

/**
 * Creates a gameplay state provider with the given database context
 * Works with both regular db connections and transaction contexts
 *
 * @param dbContext - Database connection or transaction context
 * @returns Gameplay state provider that uses the given context
 */
const createGameplayStateProvider = (dbContext: Kysely<DB>) => {
  return gameplayStateProvider(
    gameRepository.findGameByPublicId(dbContext),
    teamsRepository.getTeamsByGameId(dbContext),
    cardsRepository.getCardsByRoundId(dbContext),
    turnsRepository.getTurnsByRoundId(dbContext),
    playerRepository.findPlayersByGameId(dbContext),
    roundsRepository.getLatestRound(dbContext),
    roundsRepository.getRoundsByGameId(dbContext),
    playerRepository.getPlayerContext(dbContext),
  );
};

/**
 * Creates gameplay state components with all repository dependencies pre-wired
 *
 * @param dbContext - Database connection or transaction context
 * @returns Object containing configured state components
 */
export const gameplayState = (dbContext: Kysely<DB>) => {
  return {
    provider: createGameplayStateProvider(dbContext),
  };
};
