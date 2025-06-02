import type {
  TransactionalRepositories,
  DbContext,
} from "./gameplay-actions.db";

import { createNextRound } from "../new-round/new-round.actions";
import { dealCardsToRound } from "../deal-cards/deal-cards.actions";
import { startCurrentRound } from "../start-round/start-round.actions";

import type { GameplayStateProvider } from "../state/gameplay-state.provider";

/**
 * All gameplay operations available within a transaction context
 */
export type GameplayOperations = {
  createRound: ReturnType<typeof createNextRound>;
  dealCards: ReturnType<typeof dealCardsToRound>;
  startRound: ReturnType<typeof startCurrentRound>;
  getCurrentGameState: GameplayStateProvider;
};

/**
 * Function that executes gameplay operations within a transaction.
 *
 * The game input is "pre-loaded" with transaction aware action functions
 * that can be called safely within the closure.. no infrastructure details
 * are exposed, only pure functions that accept game state already validated
 * in the service.
 *
 * Queries executed off the game object will be run against the transaction context
 * pre-commit.
 *
 * e.g
 *
 * gameHander((game) => {
 *      await game.createRound(validState.data)
 *      await game.dealCards(validState.data)
 *
 * })
 */
export type TransactionalGameplayHandler = <TResult>(
  operation: (game: GameplayOperations) => Promise<TResult>,
) => Promise<TResult>;

/**
 * Creates a gameplay handler that executes operations within database transactions..
 *
 * The game input is "pre-loaded" with transaction aware action functions
 * that can be called safely within the closure.. no infrastructure details
 * are exposed, only pure functions that accept game state already validated
 * in the service.
 *
 * Queries executed off the game object will be run against the transaction context
 * pre-commit.
 *
 * e.g
 *
 * gameHander((game) => {
 *      await game.createRound(validState.data)
 *      await game.dealCards(validState.data)
 *
 * })
 *
 * @param db - Database connection for transaction management
 * @param repos - Repository functions for data access
 * @returns Handler that provides transactional gameplay operations
 */
export const handleGameplayActions = (
  db: DbContext,
  repos: TransactionalRepositories,
): TransactionalGameplayHandler => {
  return async (operation) => {
    return await db.transaction().execute(async (trx) => {
      const game = {
        createRound: createNextRound(repos.createRound(trx)),
        dealCards: dealCardsToRound(
          repos.getRandomWords(trx),
          repos.createCards(trx),
        ),
        startRound: startCurrentRound(repos.updateRoundStatus(trx)),
        getCurrentGameState: repos.getCurrentState(trx),
      };

      return await operation(game);
    });
  };
};
