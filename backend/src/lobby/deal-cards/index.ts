import type { LobbyStateProvider } from "../state/lobby-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";

import { dealCardsService } from "./deal-cards.service";
import { dealCardsController } from "./deal-cards.controller";

/**
 * Dependencies required by the deal cards feature
 */
export interface DealCardsDependencies {
  getLobbyState: LobbyStateProvider;
  lobbyHandler: TransactionalHandler<LobbyOperations>;
}

/**
 * Initializes the deal cards feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const dealCards = (dependencies: DealCardsDependencies) => {
  const dealCardsServiceInstance = dealCardsService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
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
