// backend/src/features/gameplay/new-round/new-round.actions.ts
import { RoundCreator } from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { Kysely, Transaction } from "kysely";
import { DB } from "@backend/common/db/db.types";

/**
 * Creates a new round action with repository dependency injection
 *
 * @param createRoundRepo - Repository factory function
 * @returns Curried function: (trx) => (gameState) => Promise<RoundResult>
 */

export type CreateRoundActionDependencies = {
  createRoundRepo: Transactional<RoundCreator>;
};

export const createRoundAction =
  (dependencies: CreateRoundActionDependencies) => (trx: Transaction<DB>) => {
    const createRound = dependencies.createRoundRepo(trx);

    return async (gameState: NewRoundValidGameState) => {
      const nextRoundNumber = complexProperties.getRoundCount(gameState) + 1;
      return await createRound({
        gameId: gameState._id,
        roundNumber: nextRoundNumber,
      });
    };
  };

// backend/src/features/gameplay/new-round/new-round.actions.ts
import { RoundCreator } from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { Kysely, Transaction } from "kysely";
import { DB } from "@backend/common/db/db.types";

/**
 * Creates a new round action with repository dependency injection
 *
 * @param createRoundRepo - Repository factory function
 * @returns Curried function: (trx) => (gameState) => Promise<RoundResult>
 */

export type CreateRoundActionDependencies = {
  createRoundRepo: Transactional<RoundCreator>;
};

export const createRoundAction =
  (dependencies: CreateRoundActionDependencies) =>
  (transactionContext: TransactionContext) => {
    const createRound = dependencies.createRoundRepo(transactionContext);

    return async (gameState: NewRoundValidGameState) => {
      const nextRoundNumber = complexProperties.getRoundCount(gameState) + 1;
      return await createRound({
        gameId: gameState._id,
        roundNumber: nextRoundNumber,
      });
    };
  };
