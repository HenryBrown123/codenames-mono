export function processIntroStage(inputState) {
    // Processing logic for 'intro' stage

   /* 
   beginning of game (gamestage = 'intro') - run after a user decides to start the game...
   the result of this processTurn call is:
        1. set gamestate.stage='codebreaker'
        2. create entry in game.rounds
   */

    }
    
export function processCodemasterStage(inputState) {
    // Processing logic for 'codemaster' stage
   /* 
    codemaster turn (gamestage='codemaster'):
        1. Updates codeword and number of guesses 
        2. Sets the gameStage: 'codebreaker'
    */

}

export function processCodebreakerStage(inputState) {
// Processing logic for 'codebreaker' stage
  /*    
    codebreaker turn (gamestage='codebreaker'):
        1. Check if any winner based on selected card(s)
        2. determine whether current game stage continues for next turn (i.e. more guesses remaining)
           or whether the game can go onto the next codemaster turn. If codemasters turn, set gameStage ='codemaster'
    */
}


