import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { roundCreationService } from "./new-round.service";
import { newRoundController } from "./new-round.controller";

/**
 * Dependencies required by the new round feature
 */
export interface NewRoundDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

/**
 * Initializes the new round feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const newRound = (dependencies: NewRoundDependencies) => {
  const createRound = roundCreationService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
  });

  const controller = newRoundController({ createRound });

  return {
    controller,
    service: createRound,
  };
};

export default newRound;
