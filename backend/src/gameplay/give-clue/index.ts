import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TurnStateProvider } from "@backend/common/state/turn-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";

import { giveClueService } from "./give-clue.service";
import { giveClueController } from "./give-clue.controller";

export interface GiveClueDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
  getTurnState: TurnStateProvider;
}

export const giveClue = (logger: AppLogger) => (dependencies: GiveClueDependencies) => {
  const service = giveClueService(logger)(dependencies);
  const controller = giveClueController(logger)({ giveClue: service });

  return { controller, service };
};

export default giveClue;
