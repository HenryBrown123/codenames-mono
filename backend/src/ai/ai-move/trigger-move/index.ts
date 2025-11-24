import type { AIPlayerService } from "@backend/ai/ai-player/ai-player.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";

import { triggerMoveService } from "./trigger-move.service";
import { triggerMoveController } from "./trigger-move.controller";

/**
 * Dependencies required by the trigger move feature
 */
export interface TriggerMoveDependencies {
  aiPlayerService: AIPlayerService;
  getGameState: GameplayStateProvider;
}

/**
 * Initializes the trigger move feature with all dependencies
 */
export const triggerMove = (dependencies: TriggerMoveDependencies) => {
  const service = triggerMoveService({
    aiPlayerService: dependencies.aiPlayerService,
    getGameState: dependencies.getGameState,
  });

  const controller = triggerMoveController({
    triggerMove: service,
  });

  return {
    controller,
    service,
  };
};

export default triggerMove;
