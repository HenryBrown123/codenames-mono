import type { AppLogger } from "@backend/common/logging";
import { TurnStateProvider } from "@backend/common/state/turn-state.provider";
import { getTurnService } from "./get-turn.service";
import { controller } from "./get-turn.controller";

/**
 * Dependencies required by the get game feature
 */
export interface GetTurnDependencies {
  getTurnState: TurnStateProvider;
}

/**
 * Creates get-turn feature with dependencies
 */
export const getTurn = (logger: AppLogger) => (deps: GetTurnDependencies) => {
  const serviceLogger = logger.for({ service: "get-turn" }).create();
  const turnService = getTurnService(deps.getTurnState);
  const getTurnController = controller(serviceLogger)(turnService);

  return {
    service: turnService,
    controller: getTurnController,
  };
};

export default getTurn;
