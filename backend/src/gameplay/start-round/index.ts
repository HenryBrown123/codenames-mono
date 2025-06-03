import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { startRoundService } from "./start-round.service";
import { startRoundController } from "./start-round.controller";

/**
 * Dependencies required by the start round feature
 */
export interface StartRoundDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

/**
 * Initializes the start round feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const startRound = (dependencies: StartRoundDependencies) => {
  const startRoundServiceInstance = startRoundService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
  });

  const controller = startRoundController({
    startRound: startRoundServiceInstance,
  });

  return {
    controller,
    service: startRoundServiceInstance,
  };
};

export default startRound;
