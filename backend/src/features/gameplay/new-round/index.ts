// backend/src/features/gameplay/new-round/index.ts
import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import { PlayerRole } from "@codenames/shared/types";

import { roundCreationService } from "./new-round.service";
import { newRoundController } from "./new-round.controller";

export interface NewRoundDependencies {
  getGameState: GameplayStateProvider;
  createActionsForRole: (role: PlayerRole) => { execute: any };
}

export const newRound = (dependencies: NewRoundDependencies) => {
  const createRound = roundCreationService({
    getGameState: dependencies.getGameState,
    createActionsForRole: dependencies.createActionsForRole,
  });

  const controller = newRoundController({
    createRound,
  });

  return {
    controller,
    service: createRound,
  };
};

export default newRound;
