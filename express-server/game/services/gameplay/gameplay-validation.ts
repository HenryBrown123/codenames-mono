import { GameState } from "@game/game-common-types";

/**
 * Validates input state... compares with old game state
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @throws {Error} - If validation fails.
 */
export function validateIntroStage(inputGameState: GameState): void {
  // if intro stage then no cards should be selected and the rounds array should be empty
  if (inputGameState.cards.some((card) => card.selected)) {
    throw new Error("No cards should be selected in the intro stage.");
  }
}

/**
 * Validates input state... compares with old game state
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @throws {Error} - If validation fails.
 */
export function validateCodemasterStage(inputGameState: GameState): void {
  // Validation logic for 'codemaster' stage
  const latestRound = inputGameState.rounds.at(-1);

  if (!latestRound) {
    throw new Error("No rounds found in the game state.");
  }

  if (!latestRound.codeword) {
    throw new Error("The latest round must have a codeword set.");
  }

  if (
    latestRound.guessesAllowed === undefined ||
    latestRound.guessesAllowed === null
  ) {
    throw new Error("The latest round must have guessesAllowed set.");
  }
}

/**
 * Validates input state... compares with old game state
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @throws {Error} - If validation fails.
 */
export function validateCodebreakerStage(inputGameState: GameState): void {
  // Validation logic for 'codebreaker' stage
}
