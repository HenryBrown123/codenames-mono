import { RoundStatusUpdater } from "@backend/common/data-access/rounds.repository";
import { GameplayStateProvider } from "../state/gameplay-state.provider";

import { startCurrentRound } from "./start-round.actions";
import { startRoundService } from "./start-round.service";
import { startRoundController } from "./start-round.controller";

/**
 * Dependencies required by the start round feature module
 */
export interface StartRoundDependencies {
  getGameState: GameplayStateProvider;
  updateRoundStatus: RoundStatusUpdater;
}

/**
 * Feature module for starting rounds in a game
 *
 * This module encapsulates all the components needed for the start round feature:
 * - Actions: Domain logic for updating round status
 * - Services: Gameplay logic and orchestration
 * - Controllers: HTTP request handling
 *
 * @param dependencies - External dependencies required by this feature
 * @returns Object containing the assembled components of the feature
 */
export const startRound = (dependencies: StartRoundDependencies) => {
  const startRoundAction = startCurrentRound(dependencies.updateRoundStatus);

  const startRoundServiceInstance = startRoundService({
    getGameState: dependencies.getGameState,
    startRoundFromValidState: startRoundAction,
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
