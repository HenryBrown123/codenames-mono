import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TurnStateProvider } from "../state/turn-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { makeGuessService } from "./make-guess.service";
import { makeGuessController } from "./make-guess.controller";

/**
 * Dependencies required by the make guess feature
 */
export interface MakeGuessDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
  getTurnState: TurnStateProvider; // ← Add turn state provider
}

/**
 * Initializes the make guess feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const makeGuess = (dependencies: MakeGuessDependencies) => {
  const makeGuessServiceInstance = makeGuessService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
    getTurnState: dependencies.getTurnState, // ← Pass turn state provider
  });

  const controller = makeGuessController({
    makeGuess: makeGuessServiceInstance,
  });

  return {
    controller,
    service: makeGuessServiceInstance,
  };
};

export default makeGuess;
