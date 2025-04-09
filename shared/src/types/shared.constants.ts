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

/**
 * Object representing the different round outcomes.
 * @readonly
 * @enum {string}
 */
export const CODEBREAKER_OUTCOME = {
  OTHER_TEAM_CARD: "OTHER_TEAM_CARD",
  BYSTANDER_CARD: "BYSTANDER_CARD",
  ASSASSIN_CARD: "ASSASSIN_CARD",
  CORRECT_TEAM_CARD: "CORRECT_TEAM_CARD",
} as const;

/**
 * Object representing the different game types.
 * @readonly
 * @enum {string}
 */
export const GAME_TYPE = {
  SINGLE_DEVICE: "SINGLE_DEVICE",
  MULTI_DEVICE: "MULT_DEVICE",
} as const;

/**
 * Object representing the different game formats.
 * @readonly
 * @enum {string}
 */
export const GAME_FORMAT = {
  QUICK_GAME: "QUICK_GAEM",
  BEST_OF_THREE: "BEST_OF_THREE",
  ROUND_ROBIN: "ROUND_ROBIN",
} as const;
