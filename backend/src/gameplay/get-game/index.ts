import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { GameDataLoader } from "@backend/common/state/game-data-loader";
import type { AppLogger } from "@backend/common/logging";

import { getGameStateService } from "./get-game.service";
import { getGameStateController } from "./get-game.controller";

export interface GetGameDependencies {
  getGameState: GameplayStateProvider;
  loadGameData: GameDataLoader;
}

export const getGame = (logger: AppLogger) => (dependencies: GetGameDependencies) => {
  const serviceLogger = logger.for({ service: "get-game" }).create();

  const service = getGameStateService(serviceLogger)({
    getGameState: dependencies.getGameState,
    loadGameData: dependencies.loadGameData,
  });

  const controller = getGameStateController({
    getGameState: service,
  });

  return { controller, service };
};

export default getGame;
