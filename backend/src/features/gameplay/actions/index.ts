// backend/src/features/gameplay/actions/index.ts
import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import * as roundsRepository from "@backend/common/data-access/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/cards.repository";

import { gameplayActions, createPlayerActions } from "./gameplay-actions";

/**
 * Creates a fully wired gameplay actions executor with all dependencies injected
 */
export const createGameplayActions = (db: Kysely<DB>) => {
  // Wire up repository dependencies
  const repos = {
    createRound: roundsRepository.createNewRound,
    getRandomWords: cardsRepository.getRandomWords,
    createCards: cardsRepository.createCards,
    updateRoundStatus: roundsRepository.updateRoundStatus,
  };

  // Create the actions builder with repository dependencies
  const actionsBuilder = createPlayerActions(repos);

  // Return the configured gameplay actions executor
  return gameplayActions(db, actionsBuilder);
};

// Re-export for testing
export { gameplayActions, createPlayerActions } from "./gameplay-actions";
export type { ActionsBuilder, GameplayRepositories } from "./gameplay-actions";
