import type { AIPlayerService } from "@backend/ai/ai-player/ai-player.service";
import type { GameplayStateProvider } from "@backend/game/gameplay/state/gameplay-state.provider";
import type { DbContext } from "@backend/common/data-access/transaction-handler";
import type { AppLogger } from "@backend/common/logging";

import triggerMove from "./trigger-move";
import getStatus from "./get-status";

/**
 * Dependencies required by the ai-move feature
 */
export interface AiMoveDependencies {
  aiPlayerService: AIPlayerService;
  getGameState: GameplayStateProvider;
  db: DbContext;
}

/**
 * Initializes the ai-move feature with all sub-features
 */
export const aiMove = (logger: AppLogger) => (dependencies: AiMoveDependencies) => {
  const triggerMoveFeature = triggerMove(logger)({
    aiPlayerService: dependencies.aiPlayerService,
    getGameState: dependencies.getGameState,
  });

  const getStatusFeature = getStatus({
    getGameState: dependencies.getGameState,
    db: dependencies.db,
  });

  return {
    triggerMove: triggerMoveFeature,
    getStatus: getStatusFeature,
  };
};

export default aiMove;
