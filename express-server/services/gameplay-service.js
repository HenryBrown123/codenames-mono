/**
 * Main function for running gameplay logic. Takes the current game state as an input, and
 * returns a new game state for the next stage.
 *
 * @param {Object} updatedGameState
 */

function processTurn(updatedGameState) {
  /* 

    validate input...
        1. if codemaster stage then only codeword and guesses should be updated
        2. if codebreaker stage then only selected words should be updated (one at a time)

    */
  /* 
    codemaster turn (gamestage='codemaster'):
        1. Updates codeword and number of guesses 
        2. Sets the gameStage: 'codebreaker'
    */
  /*    
    codebreaker turn (gamestage='codebreaker'):
        1. Check if any winner based on selected card(s)
        2. determine whether current game stage continues for next turn (i.e. more guesses remaining)
           or whether the game can go onto the next codemaster turn.
    */
  /* 

    all turns: 
        1. Persists updated game state to db
        2. returns new game state (so controller can return back to the client)
    */
}
