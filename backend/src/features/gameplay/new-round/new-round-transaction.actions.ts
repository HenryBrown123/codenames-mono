// src/features/gameplay/new-round/new-round.actions.ts
import { createNewRound } from "@backend/common/data-access/rounds.repository";
import { assignPlayerRoles } from "@backend/common/data-access/player-roles.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { Transaction } from "kysely";
import { DB } from "@backend/common/db/db.types";
/**
 * Creates a round creation action that works with transactions
 */
export const createRoundAction = (db: Transaction<DB>) => {
  const roundRepo = createNewRound(db);

  return async (gameState: NewRoundValidGameState) => {
    const nextRoundNumber = complexProperties.getRoundCount(gameState) + 1;
    return await roundRepo({
      gameId: gameState._id,
      roundNumber: nextRoundNumber,
    });
  };
};

/*

except now my actions are combined....  why not..... 
1 inject db: Kysely<DB> at composition root to createGameplayActions... 
i.e. actions = createGameplayActions(db) .... calling actions.execute() 
then creates a transaction from db and partially applies those to the repository 
functions that the actions depend on before passing those repository functions 
(with the trx partially applied) into the actions for use within the closure.

*/
