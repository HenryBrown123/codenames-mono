import { Team } from "@game/game-common-types";

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
 * Object representing the different round outcomes
 * @readonly
 * @enum {string}
 */

export const CODEBREAKER_OUTCOMES = {
  OTHER_TEAM_CARD: "OTHER_TEAM_CARD",
  BYSTANDER_CARD: "BYSTANDER_CARD",
  ASSASSIN_CARD: "ASSASSIN_CARD",
  CORRECT_TEAM_CARD: "CORRECT_TEAM_CARD",
} as const;
