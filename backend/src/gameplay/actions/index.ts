import { Kysely } from "kysely";
import { DB } from "@backend/common/db/db.types";

import * as roundsRepository from "@backend/common/data-access/rounds.repository";
import * as cardsRepository from "@backend/common/data-access/cards.repository";

import { gameplayState } from "../state";
import { handleGameplayActions } from "./gameplay-actions.handler";

/**
 * Creates gameplay action components with all repository dependencies pre-wired
 *
 * @param dbContext - Database connection for transaction management
 * @returns Object containing configured action components
 */
export const gameplayActions = (dbContext: Kysely<DB>) => {
  const repos = {
    // Query repositories called within a gampeplay action context
    // (pre-commit if action used witin a transaction)
    getCurrentState: (db: Kysely<DB>) => gameplayState(db).provider,

    // Command repositories
    createRound: roundsRepository.createNewRound,
    getRandomWords: cardsRepository.getRandomWords,
    createCards: cardsRepository.createCards,
    updateRoundStatus: roundsRepository.updateRoundStatus,
  };

  return {
    handler: handleGameplayActions(dbContext, repos),
  };
};
