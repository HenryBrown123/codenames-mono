import Game, { GameDocument } from "@backend/game/models/game-model";
import { GameState, GameData } from "@codenames/shared/src/game/game-types";

/**
 * Fetches the current state from the database.
 *
 * @param {string} id - The game ID.
 * @returns {Promise<GameDocument>} - The current game state.
 * @throws {Error} - If the game state cannot be found.
 */
export async function fetchGameDocument(id: string): Promise<GameDocument> {
  const game = await Game.findById(id);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
}

/**
 * Updates the game state with new properties.
 *
 * @param {string} id - The game ID.
 * @param {Partial<GameState>} updates - The properties to update.
 * @returns {Promise<GameDocument>} - The updated game state.
 * @throws {Error} - If the game state cannot be found or updated.
 */
export async function updateGameDocument(
  id: string,
  updatedState: GameState,
): Promise<GameDocument> {
  console.log("Update to persist : ", `(game id ${id} `, updatedState);
  const updatedGameData: Partial<GameData> = { state: updatedState };
  const updatedGame = await Game.findByIdAndUpdate(id, updatedGameData, {
    new: true,
    runValidators: true,
  });
  console.log("Returned game state after persist: ", updatedGame);
  if (!updatedGame) {
    throw new Error("Failed to update game state");
  }
  return updatedGame;
}
