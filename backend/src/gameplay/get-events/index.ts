import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { DbContext } from "@backend/common/data-access/transaction-handler";
import type { AppLogger } from "@backend/common/logging";

import * as gameEventsRepository from "@backend/common/data-access/repositories/game-events.repository";
import { getEventsService } from "./get-events.service";
import { getEventsController } from "./get-events.controller";

/**
 * Dependencies required by the get events feature
 */
export interface GetEventsDependencies {
  getGameState: GameplayStateProvider;
  db: DbContext;
}

/**
 * Initializes the get events feature with all dependencies
 */
export const getEvents = (logger: AppLogger) => (dependencies: GetEventsDependencies) => {
  const service = getEventsService(logger)({
    getEventsByGameId: gameEventsRepository.getEventsByGameId(dependencies.db),
    getGameState: dependencies.getGameState,
  });

  const controller = getEventsController({
    getEvents: service,
  });

  return {
    controller,
    service,
  };
};

export default getEvents;
