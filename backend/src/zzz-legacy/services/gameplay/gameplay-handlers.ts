// @ts-nocheck
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

import { GameState } from "@codenames/shared/src/game/game-types";

/**
 * Handles the intro stage: validates, processes, and returns updated game state.
 *
 * @param {string} gameId - The ID of the game to update.
 * @param {GameState} inputGameState - The current state of the game provided by the client.
 * @returns {Promise<GameState>} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export async function handleIntroStage(
  inputGameState: GameState,
): Promise<GameState> {
  validateIntroStage(inputGameState);
  return processIntroStage(inputGameState);
}

/**
 * Handles the codemaster stage: validates, processes, and returns updated game state.
 *
 * @param {string} gameId - The ID of the game to update.
 * @param {GameState} inputGameState - The current state of the game provided by the client.
 * @returns {Promise<GameState>} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export async function handleCodemasterStage(
  inputGameState: GameState,
): Promise<GameState> {
  validateCodemasterStage(inputGameState);
  return processCodemasterStage(inputGameState);
}

/**
 * Handles the codebreaker stage: validates, processes, and returns updated game state.
 *
 * @param {string} gameId - The ID of the game to update.
 * @param {GameState} inputGameState - The current state of the game provided by the client.
 * @returns {Promise<GameState>} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export async function handleCodebreakerStage(
  inputGameState: GameState,
): Promise<GameState> {
  validateCodebreakerStage(inputGameState);
  return processCodebreakerStage(inputGameState);
}

/**
 * Handles the game over stage. Throws an error as no more turns are allowed.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @throws {Error} - Always throws an error as the game is over.
 */
export function handleGameOverStage(inputGameState: GameState): never {
  throw new Error("Game has finished. No more turns.");
}
