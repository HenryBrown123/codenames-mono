import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { dealCardsService } from "./deal-cards.service";
import { dealCardsController } from "./deal-cards.controller";

/**
 * Dependencies required by the deal cards feature
 */
export interface DealCardsDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

/**
 * Initializes the deal cards feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const dealCards = (dependencies: DealCardsDependencies) => {
  const dealCardsServiceInstance = dealCardsService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
  });

  const controller = dealCardsController({
    dealCards: dealCardsServiceInstance,
  });

  return {
    controller,
    service: dealCardsServiceInstance,
  };
};

export default dealCards;
