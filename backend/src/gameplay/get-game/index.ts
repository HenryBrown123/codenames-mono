import type { GameplayStateProvider } from "../state/gameplay-state.provider";

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
 * @param dependencies - Required services
 * @returns Feature components for use in route setup
 */
export const getGame = (dependencies: GetGameDependencies) => {
  const service = getGameStateService({
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
