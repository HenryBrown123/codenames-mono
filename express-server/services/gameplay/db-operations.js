export async function fetchCurrentStateFromDB(id) {
  // Fetch current state from DB
  return await Game.findById(id);
}

export async function updateGameState(id) {
  // updates the game state with the new properties.
}
