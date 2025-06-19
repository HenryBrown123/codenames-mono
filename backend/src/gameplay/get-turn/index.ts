import { TurnStateProvider } from "../state/turn-state.provider";
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
export const getTurn = (deps: GetTurnDependencies) => {
  const turnService = getTurnService(deps.getTurnState);
  const getTurnController = controller(turnService);

  return {
    service: turnService,
    controller: getTurnController,
  };
};

export default getTurn;
