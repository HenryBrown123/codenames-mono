import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { AppLogger } from "@backend/common/logging";

import { getGameStateService } from "./get-game.service";
import { getGameStateController } from "./get-game.controller";

/**
 * Dependencies required by the get game feature
 */
export interface GetGameDependencies {
  getGameState: GameplayStateProvider;
}

/**
 * Initializes the get game feature with all dependencies
 *
 * @param logger - Feature logger
 * @returns Factory function that accepts dependencies
 */
export const getGame = (logger: AppLogger) => (dependencies: GetGameDependencies) => {
  const serviceLogger = logger.for({ service: "get-game" }).create();

  const service = getGameStateService(serviceLogger)({
    getGameState: dependencies.getGameState,
  });

  const controller = getGameStateController({
    getGameState: service,
  });

  return {
    controller,
    service,
  };
};

export default getGame;
