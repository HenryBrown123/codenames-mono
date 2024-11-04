/**
 * Object representing teams in the game.
 * @readonly
 * @enum {string}
 */
export const TEAM = {
  RED: "red",
  GREEN: "green",
  ASSASSIN: "assassin",
  BYSTANDER: "bystander",
} as const;

/**
 * Object representing the different stages of the game.
 * @readonly
 * @enum {string}
 */
export const STAGE = {
  INTRO: "intro",
  CODEMASTER: "codemaster",
  CODEBREAKER: "codebreaker",
  GAMEOVER: "gameover",
} as const;
