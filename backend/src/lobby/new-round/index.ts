import type { LobbyStateProvider } from "../state/lobby-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";

import { roundCreationService } from "./new-round.service";
import { newRoundController } from "./new-round.controller";

/**
 * Dependencies required by the new round feature
 */
export interface NewRoundDependencies {
  getLobbyState: LobbyStateProvider;
  lobbyHandler: TransactionalHandler<LobbyOperations>;
}

/**
 * Initializes the new round feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const newRound = (dependencies: NewRoundDependencies) => {
  const createRound = roundCreationService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
  });

  const controller = newRoundController({ createRound });

  return {
    controller,
    service: createRound,
  };
};

export default newRound;
