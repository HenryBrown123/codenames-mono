import { createNewRound } from "@backend/common/data-access/rounds.repository";
import { createNextRound } from "./new-round.actions";
import { roundCreationService } from "./new-round.service";
import { newRoundController } from "./new-round.controller";
import { gameplayStateProvider } from "../state/gameplay-state.provider";

/**
 * Dependencies required by the new round feature module
 */
export interface NewRoundDependencies {
  getGameState: ReturnType<typeof gameplayStateProvider>;
  createRound: ReturnType<typeof createNewRound>;
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

  const controller = newRoundController({
    createRound,
  });

  return {
    controller,
    service: createRound,
  };
};

// Default export for convenient importing
export default newRound;
