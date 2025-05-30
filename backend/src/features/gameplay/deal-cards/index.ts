// backend/src/features/gameplay/deal-cards/index.ts
import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import { PlayerRole } from "@codenames/shared/types";

import { dealCardsService } from "./deal-cards.service";
import { dealCardsController } from "./deal-cards.controller";

export interface DealCardsDependencies {
  getGameState: GameplayStateProvider;
  createActionsForRole: (role: PlayerRole) => { execute: any };
}

export const dealCards = (dependencies: DealCardsDependencies) => {
  const dealCardsServiceInstance = dealCardsService({
    getGameState: dependencies.getGameState,
    createActionsForRole: dependencies.createActionsForRole,
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
