/**
 * End Turn Feature
 */

import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { createEndTurnService } from "./end-turn.service";
import { createEndTurnController } from "./end-turn.controller";

export interface EndTurnFeatureDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

export const endTurn = (dependencies: EndTurnFeatureDependencies) => {
  const endTurnServiceInstance = createEndTurnService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
  });

  const controller = createEndTurnController(endTurnServiceInstance); // TODO: add authHandlers

  return {
    controller,
    service: endTurnServiceInstance,
  };
};

export default endTurn;
export type { EndTurnService, EndTurnResult } from "./end-turn.service";
