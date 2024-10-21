import {
  validateIntroStage,
  validateCodemasterStage,
  validateCodebreakerStage,
} from "./validation.js";

import {
  processIntroStage,
  processCodemasterStage,
  processCodebreakerStage,
} from "./processing.js";

/**
 * Validates input state and processes various game stages.
 *
 * @param {Object} inputGameObject - The current state of the game.
 * @returns {Object} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export function handleIntroStage(inputGameObject) {
  validateIntroStage(inputGameObject);
  return processIntroStage(inputGameObject);
}

export function handleCodemasterStage(inputGameObject) {
  validateCodemasterStage(inputGameObject);
  return processCodemasterStage(inputGameObject);
}

export function handleCodebreakerStage(inputGameObject) {
  validateCodebreakerStage(inputGameObject);
  return processCodebreakerStage(inputGameObject);
}
