import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { GameplayOperations } from "../gameplay-actions";
import type { AppLogger } from "@backend/common/logging";

import { createStartTurnService } from "./start-turn.service";
import { createStartTurnController } from "./start-turn.controller";

export interface StartTurnFeatureDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalHandler<GameplayOperations>;
}

export const startTurn = (logger: AppLogger) => (dependencies: StartTurnFeatureDependencies) => {
  const service = createStartTurnService(logger)(dependencies);
  const controller = createStartTurnController(logger)(service);

  return { controller, service };
};

export default startTurn;
export type { StartTurnService, StartTurnResult } from "./start-turn.service";
