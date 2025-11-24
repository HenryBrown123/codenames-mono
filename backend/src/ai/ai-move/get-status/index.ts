import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { DbContext } from "@backend/common/data-access/transaction-handler";

import * as aiPipelineRunsRepository from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import * as gamesRepository from "@backend/common/data-access/repositories/games.repository";
import { getStatusService } from "./get-status.service";
import { getStatusController } from "./get-status.controller";

/**
 * Dependencies required by the get status feature
 */
export interface GetStatusDependencies {
  getGameState: GameplayStateProvider;
  db: DbContext;
}

/**
 * Initializes the get status feature with all dependencies
 */
export const getStatus = (dependencies: GetStatusDependencies) => {
  const service = getStatusService({
    findRunningPipeline: aiPipelineRunsRepository.findRunningByGameId(dependencies.db),
    findGameByPublicId: gamesRepository.findGameByPublicId(dependencies.db),
    getGameState: dependencies.getGameState,
  });

  const controller = getStatusController({
    getStatus: service,
  });

  return {
    controller,
    service,
  };
};

export default getStatus;
