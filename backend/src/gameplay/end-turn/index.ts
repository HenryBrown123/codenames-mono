import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";

import { createEndTurnService } from "./end-turn.service";
import { createEndTurnController } from "./end-turn.controller";

export interface EndTurnFeatureDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

export const endTurn = (logger: AppLogger) => (dependencies: EndTurnFeatureDependencies) => {
  const service = createEndTurnService(logger)(dependencies);
  const controller = createEndTurnController(logger)(service);

  return { controller, service };
};

export default endTurn;
export type { EndTurnService, EndTurnResult } from "./end-turn.service";
