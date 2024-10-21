/**
 * validate input... compare with old game state
 *
 * @param {*} inputGameObject
 */

export function validateIntroStage(inputGameObject) {
  // Validation logic for 'intro' stage
  // if intro stage then no cards should be selected and the rounds array should be empty
}

export function validateCodemasterStage(inputGameObject) {
  // Validation logic for 'codemaster' stage
  // if codemaster stage then only codeword and guesses should be updated
}

export function validateCodebreakerStage(inputGameObject) {
  // Validation logic for 'codebreaker' stage
  // if codebreaker stage then only selected words should be updated (one at a time)
}
