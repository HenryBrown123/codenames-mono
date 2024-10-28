import {
  handleIntroStage,
  handleCodemasterStage,
  handleCodebreakerStage,
  handleGameOverStage,
} from "./gameplay-handlers";
import { GameState, Stage } from "src/game/game-common-types";

// defines the function type of handlers. Must accept a GameState and return a GameState
// unless an error is thrown...
type GameStageHandler = (inputGameState: GameState) => GameState;

// Game stage handler lookup object. All game stages must feature
const gameStageHandlers: Record<Stage, GameStageHandler> = {
  intro: handleIntroStage,
  codemaster: handleCodemasterStage,
  codebreaker: handleCodebreakerStage,
  gameover: handleGameOverStage,
};

/**
 * Main function for executing gameplay logic depending on the input state.
 *
 * The game stage passed in as part of the inputGameObject determines which handler to run,
 * which will then validate the input state against the previously persisted state, before running
 * the relevant gameplay logic and outputting an object representing the next state of the game
 * to return via the API (and display on UI).
 *
 * @param {GameState} inputGameObject - The current state of the game.
 * @returns {Promise<GameState>} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export async function executeTurn(
  inputGameObject: GameState
): Promise<GameState> {
  const handleStage = gameStageHandlers[inputGameObject.stage];
  if (!handleStage) {
    throw new Error("Invalid game stage");
  }
  try {
    return handleStage(inputGameObject); // Validate and process in sequence
  } catch (error: any) {
    throw new Error(`Process turn failed: ${error.message}`);
  }
}
