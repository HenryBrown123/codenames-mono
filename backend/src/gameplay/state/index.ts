import {
  DbContext,
  TransactionContext,
} from "@backend/common/data-access/transaction-handler";

import * as gameRepository from "@backend/common/data-access/repositories/games.repository";
import * as roundsRepository from "@backend/common/data-access/repositories/rounds.repository";
import * as playerRepository from "@backend/common/data-access/repositories/players.repository";
import * as teamsRepository from "@backend/common/data-access/repositories/teams.repository";
import * as cardsRepository from "@backend/common/data-access/repositories/cards.repository";
import * as turnsRepository from "@backend/common/data-access/repositories/turns.repository";

import { turnStateProvider } from "./turn-state.provider";
import { gameplayStateProvider } from "./gameplay-state.provider";
import { playerSpecificStateProvider } from "./player-specific-state.provider";

/**
 * Creates a turn state provider with the given database context
 * Works with both regular db connections and transaction contexts
 *
 * @param dbContext - Database connection or transaction context
 * @returns Turn state provider that uses the given context
 */
export const createTurnStateProvider = (dbContext: DbContext) => {
  return turnStateProvider(turnsRepository.getTurnByPublicId(dbContext));
};

export type TurnStateProvider = ReturnType<typeof createTurnStateProvider>;

/**
 * Creates turn state components with all repository dependencies pre-wired
 *
 * @param dbContext - Database connection or transaction context
 * @returns Object containing configured state components
 */
export const turnState = (dbContext: DbContext) => {
  return {
    provider: createTurnStateProvider(dbContext),
  };
};

/**
 * Creates a gameplay state provider with the given database context
 * Works with both regular db connections and transaction contexts
 *
 * @param dbContext - Database connection or transaction context
 * @returns Gameplay state provider that uses the given context
 */
const createGameplayStateProvider = (
  dbContext: DbContext | TransactionContext,
) => {
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
 * Creates a player-specific state provider with the given database context
 * Works with both regular db connections and transaction contexts
 *
 * @param dbContext - Database connection or transaction context
 * @returns Player-specific state provider that uses the given context
 */
const createPlayerSpecificStateProvider = (
  dbContext: DbContext | TransactionContext,
) => {
  return playerSpecificStateProvider(
    gameRepository.findGameByPublicId(dbContext),
    teamsRepository.getTeamsByGameId(dbContext),
    cardsRepository.getCardsByRoundId(dbContext),
    turnsRepository.getTurnsByRoundId(dbContext),
    playerRepository.findPlayersByGameId(dbContext),
    roundsRepository.getLatestRound(dbContext),
    roundsRepository.getRoundsByGameId(dbContext),
    playerRepository.findPlayerByPublicId(dbContext),
  );
};

/**
 * Creates gameplay state components with all repository dependencies pre-wired
 *
 * @param dbContext - Database connection or transaction context
 * @returns Object containing configured state components
 */
export const gameplayState = (dbContext: DbContext | TransactionContext) => {
  return {
    provider: createGameplayStateProvider(dbContext),
    playerSpecificProvider: createPlayerSpecificStateProvider(dbContext),
  };
};
