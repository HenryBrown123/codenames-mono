import { handleIntroStage, handleCodemasterStage, handleCodebreakerStage } from "./handlers";

// object mapping each game stage to its handler
const gameStageHandlers = {
intro: handleIntroStage,
codemaster: handleCodemasterStage,
codebreaker: handleCodebreakerStage,
};

/**
 * Main function for executing gameplay logic depending on the input state. 
 * 
 * The game stage passed in as part of the inputState object determines which handler to run, which will then
 * validate the input state against the currently persisted state, before running the relavent game play logic 
 * and outputting a object representing the next state of the game to return via api (and display on ui)
 * 
 * @param {*} inputState 
 * @returns 
 */

export async function executeTurn(inputState) {
    const currentState = await fetchCurrentStateFromDB(inputState.id);
    
    const handleStage = gameStageHandlers[inputState.stage];
    if (!handleStage) {
      throw new Error('Invalid game stage');
    }
    try {
      return await handleStage(inputState, currentState); // Validate and process in sequence
    } catch (error) {
      throw new Error(`Process turn failed: ${error.message}`);
    }
}