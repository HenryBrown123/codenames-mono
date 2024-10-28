import {
  validateIntroStage,
  validateCodemasterStage,
  validateCodebreakerStage,
} from "./gameplay-validation";
import {
  processIntroStage,
  processCodemasterStage,
  processCodebreakerStage,
} from "./gameplay-processing";

import { GameState } from "src/game/game-common-types";

/**
 * Validates input state and processes various game stages.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export function handleIntroStage(inputGameState: GameState): GameState {
  validateIntroStage(inputGameState);
  return processIntroStage(inputGameState);
}

export function handleCodemasterStage(inputGameState: GameState): GameState {
  validateCodemasterStage(inputGameState);
  return processCodemasterStage(inputGameState);
}

export function handleCodebreakerStage(inputGameState: GameState): GameState {
  validateCodebreakerStage(inputGameState);
  return processCodebreakerStage(inputGameState);
}

export function handleGameOverStage(inputGameState: GameState): never {
  throw new Error("Game has finished. No more turns.");
}
