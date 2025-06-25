import type { LobbyStateProvider } from "../state/lobby-state.provider";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";

import { startRoundService } from "./start-round.service";
import { startRoundController } from "./start-round.controller";

/**
 * Dependencies required by the start round feature
 */
export interface StartRoundDependencies {
  getLobbyState: LobbyStateProvider;
  lobbyHandler: TransactionalHandler<LobbyOperations>;
}

/**
 * Initializes the start round feature with all dependencies
 *
 * @param dependencies - Required services and handlers
 * @returns Feature components for use in route setup
 */
export const startRound = (dependencies: StartRoundDependencies) => {
  const startRoundServiceInstance = startRoundService({
    getLobbyState: dependencies.getLobbyState,
    lobbyHandler: dependencies.lobbyHandler,
  });

  const controller = startRoundController({
    startRound: startRoundServiceInstance,
  });

  return {
    controller,
    service: startRoundServiceInstance,
  };
};

export default startRound;
