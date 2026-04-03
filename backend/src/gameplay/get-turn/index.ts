import type { AppLogger } from "@backend/common/logging";
import { TurnStateProvider } from "@backend/common/state/turn-state.provider";
import { TurnsFinder, RoundId } from "@backend/common/data-access/repositories/turns.repository";
import { PlayerFinderAll, RoundId as PlayerRoundId } from "@backend/common/data-access/repositories/players.repository";
import { getTurnService } from "./get-turn.service";
import { controller } from "./get-turn.controller";

/**
 * Dependencies required by the get-turn feature
 */
export interface GetTurnDependencies {
  getTurnState: TurnStateProvider;
  getTurnsByRoundId: TurnsFinder<RoundId>;
  findPlayersByRoundId: PlayerFinderAll<PlayerRoundId>;
}

/**
 * Creates get-turn feature with dependencies
 */
export const getTurn = (logger: AppLogger) => (deps: GetTurnDependencies) => {
  const serviceLogger = logger.for({ service: "get-turn" }).create();
  const turnService = getTurnService({
    getTurnState: deps.getTurnState,
    getTurnsByRoundId: deps.getTurnsByRoundId,
    findPlayersByRoundId: deps.findPlayersByRoundId,
  });
  const getTurnController = controller(serviceLogger)(turnService);

  return {
    service: turnService,
    controller: getTurnController,
  };
};

export default getTurn;
