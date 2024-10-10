import { validateIntroStage, validateCodemasterStage, validateCodebreakerStage } from './validation.js';
import { processIntroStage, processCodemasterStage, processCodebreakerStage } from './processing.js';

/**
 * Validates and processes various game stages.
 *
 * @param {Object} inputState - The current state of the game.
 * @returns {Object} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export function handleIntroStage(inputState) {
    validateIntroStage(inputState);
    return processIntroStage(inputState);
  }
  
export function handleCodemasterStage(inputState) {
    validateCodemasterStage(inputState);
    return processCodemasterStage(inputState);
}

export function handleCodebreakerStage(inputState) {
    validateCodebreakerStage(inputState);
    return processCodebreakerStage(inputState);
}