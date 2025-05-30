import { RoundCreator } from "@backend/common/data-access/rounds.repository";
import { GameplayStateProvider } from "../state/gameplay-state.provider";

import { createNextRound } from "./new-round.actions";
import { roundCreationService } from "./new-round.service";
import { newRoundController } from "./new-round.controller";

/**
 * Dependencies required by the new round feature module
 */
export interface NewRoundDependencies {
  getGameState: GameplayStateProvider;
  createRound: RoundCreator;
}

/**
 * Feature module for creating new rounds in a game
 *
 * This module encapsulates all the components needed for the new round feature:
 * - Actions: Domain logic for creating rounds
 * - Services: Gameplay logic and orchestration
 * - Controllers: HTTP request handling
 *
 * @param dependencies - External dependencies required by this feature
 * @returns Object containing the assembled components of the feature
 */
export const newRound = (dependencies: NewRoundDependencies) => {
  const createRoundAction = createNextRound(dependencies.createRound);

  const createRound = roundCreationService({
    getGameState: dependencies.getGameState,
    createRoundFromValidState: createRoundAction,
  });

  const createRoundController = newRoundController({
    createRound,
  });

  return {
    controller: createRoundController,
    service: createRound,
  };
};

// Default export for convenient importing
export default newRound;
