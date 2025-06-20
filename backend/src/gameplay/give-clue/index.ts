import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { TurnStateProvider } from "../state/turn-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";

import { giveClueService } from "./give-clue.service";
import { giveClueController } from "./give-clue.controller";

/**
 * Dependencies required by the give clue feature
 */
export interface GiveClueDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
  getTurnState: TurnStateProvider; // ← Add turn state provider
}

/**
 * Initializes the give clue feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const giveClue = (dependencies: GiveClueDependencies) => {
  const giveClueServiceInstance = giveClueService({
    getGameState: dependencies.getGameState,
    gameplayHandler: dependencies.gameplayHandler,
    getTurnState: dependencies.getTurnState, // ← Pass turn state provider
  });

  const controller = giveClueController({
    giveClue: giveClueServiceInstance,
  });

  return {
    controller,
    service: giveClueServiceInstance,
  };
};

export default giveClue;
