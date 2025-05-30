// backend/src/features/gameplay/start-round/index.ts
import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import { PlayerRole } from "@codenames/shared/types";

import { startRoundService } from "./start-round.service";
import { startRoundController } from "./start-round.controller";

export interface StartRoundDependencies {
  getGameState: GameplayStateProvider;
  createActionsForRole: (role: PlayerRole) => { execute: any };
}

export const startRound = (dependencies: StartRoundDependencies) => {
  const startRoundServiceInstance = startRoundService({
    getGameState: dependencies.getGameState,
    createActionsForRole: dependencies.createActionsForRole,
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
