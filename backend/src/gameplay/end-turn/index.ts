import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { GameplayHandler } from "../gameplay-actions";
import type { GameDataLoader } from "@backend/common/state/game-data-loader";
import type { AppLogger } from "@backend/common/logging";
import { createResolveGameplayContext } from "../shared/resolve-gameplay-context";

import { createEndTurnService } from "./end-turn.service";
import { createEndTurnController } from "./end-turn.controller";

export interface EndTurnFeatureDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: GameplayHandler;
  loadGameData: GameDataLoader;
}

export const endTurn = (logger: AppLogger) => (dependencies: EndTurnFeatureDependencies) => {
  const service = createEndTurnService(logger)({
    gameplayHandler: dependencies.gameplayHandler,
  });

  const resolveContext = createResolveGameplayContext({
    getGameState: dependencies.getGameState,
    loadGameData: dependencies.loadGameData,
  });

  const controller = createEndTurnController(logger)({
    endTurn: service,
    resolveContext,
    loadGameData: dependencies.loadGameData,
  });

  return { controller, service };
};

export default endTurn;
export type { EndTurnService, EndTurnResult } from "./end-turn.service";
