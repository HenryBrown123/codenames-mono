import {
  handleIntroStage,
  handleCodemasterStage,
  handleCodebreakerStage,
  handleGameOverStage,
} from "./gameplay-handlers";
import { GameState, Card, Stage } from "@game/game-common-types";
import { STAGE } from "@game/game-common-constants";
import { fetchGameDocument, updateGameDocument } from "./db-operations";

// defines the function type of handlers. Must accept a GameState and return a Promise<GameState>
// unless an error is thrown...
type GameStageHandler = (
  inputGameState: GameState
) => Promise<GameState> | never;

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
 * @param {string} gameId - The ID of the game to update.
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {Promise<GameState>} - The updated game state after processing.
 * @throws {Error} - If validation fails or processing encounters an issue.
 */
export async function executeTurn(
  gameId: string,
  inputGameState: GameState
): Promise<GameState> {
  const handleStage = gameStageHandlers[inputGameState.stage];
  if (!handleStage) {
    console.log("executeTurn: invalid game stage");
    throw new Error("Invalid game stage");
  }
  try {
    // Fetch the persisted game state and hydraft the input game state with card teams
    const originalGameState = await fetchGameDocument(gameId);
    const hydratedGameState = addTeamPropToCard(
      inputGameState,
      originalGameState.state.cards
    );

    // Process the hydrated game state & persist to db
    const updatedGameState = await handleStage(hydratedGameState);
    console.log(
      "executeTurn: updated game state to persist: ",
      updatedGameState
    );
    await updateGameDocument(gameId, updatedGameState);

    // if not a codemaster stage then sanitise game state to remove teams from unselected cards
    if (updatedGameState.stage !== STAGE.CODEMASTER) {
      return sanitizeGameStateForClient(updatedGameState);
    }

    return updatedGameState;
  } catch (error: any) {
    console.log("executeTurn failed: ", error.message);
    throw new Error(`Process turn failed: ${error.message}`);
  }
}

/**
 * Adds the team property to each card in the input game state based on the original game state's cards.
 *
 * @param {GameState} inputGameState - The current state of the game provided by the client.
 * @param {Array<Card>} originalCards - The original cards array from the game state (from the database).
 * @returns {GameState} - The updated input game state with team properties added from the original game state.
 */
function addTeamPropToCard(
  inputGameState: GameState,
  originalCards: Card[]
): GameState {
  return {
    ...inputGameState,
    cards: inputGameState.cards.map((card, index) => ({
      ...card,
      team: originalCards[index].team,
    })),
  };
}

/**
 * Utility function to sanitize the game state for client consumption.
 * Removes team information from unselected cards to prevent cheating.
 *
 * @param {GameState} gameState - The game state to sanitize.
 * @returns {GameState} - The sanitized game state.
 */
function sanitizeGameStateForClient(gameState: GameState): GameState {
  return {
    ...gameState,
    cards: gameState.cards.map((card: Card) => ({
      ...card,
      team: card.selected ? card.team : undefined, // Remove team color if not selected
    })),
  };
}
