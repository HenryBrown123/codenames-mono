// @ts-nocheck
import { GameState } from "@codenames/shared/src/game/game-types";
import { STAGE } from "@codenames/shared/src/game/game-constants";
import GameStateProcessor from "./gameplay-state-common";
import CodebreakerStateProcessor from "./gameplay-state-codebreaker";

/**
 * Processes the 'intro' stage and returns an updated game object.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the intro stage.
 */
export function processIntroStage(inputGameState: GameState): GameState {
  return GameStateProcessor.from(inputGameState)
    .updateStage(STAGE.CODEMASTER)
    .finalize();
}

/**
 * Processes the 'codemaster' stage and returns an updated game object.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the codemaster stage.
 */
export function processCodemasterStage(inputGameState: GameState): GameState {
  return GameStateProcessor.from(inputGameState)
    .updateStage(STAGE.CODEBREAKER)
    .finalize();
}

/**
 * Processes the 'codebreaker' stage and returns an updated game object... uses its own modifier object
 * due to more state update logic needed, (different strategies for different outcomes)
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the codebreaker stage.
 */
export function processCodebreakerStage(inputGameState: GameState): GameState {
  return CodebreakerStateProcessor.from(inputGameState)
    .markCardAsSelected()
    .updateTurnOutcome() // Determine and store the outcome of the turn
    .executeCodebreakerTurnStrategy() // Apply strategy logic based on the turn outcome
    .finalize();
}
