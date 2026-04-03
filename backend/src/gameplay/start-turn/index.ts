import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { GameplayHandler } from "../gameplay-actions";
import type { GameDataLoader } from "@backend/common/state/game-data-loader";
import type { AppLogger } from "@backend/common/logging";
import { createResolveGameplayContext } from "../shared/resolve-gameplay-context";

import { createStartTurnService } from "./start-turn.service";
import { createStartTurnController } from "./start-turn.controller";

export interface StartTurnFeatureDependencies {
  getGameState: GameplayStateProvider;
  gameplayHandler: GameplayHandler;
  loadGameData: GameDataLoader;
}

export const startTurn = (logger: AppLogger) => (dependencies: StartTurnFeatureDependencies) => {
  const service = createStartTurnService(logger)({
    gameplayHandler: dependencies.gameplayHandler,
  });

  const resolveContext = createResolveGameplayContext({
    getGameState: dependencies.getGameState,
    loadGameData: dependencies.loadGameData,
  });

  const controller = createStartTurnController(logger)({
    startTurn: service,
    resolveContext,
    loadGameData: dependencies.loadGameData,
  });

  return { controller, service };
};

export default startTurn;
export type { StartTurnService, StartTurnResult } from "./start-turn.service";
