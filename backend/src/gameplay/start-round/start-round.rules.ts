import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";

import {
  GameAggregate,
  roundSchema,
  gameplayBaseSchema,
} from "../state/gameplay-state.types";

import { complexProperties } from "../state/gameplay-state.helpers";

import {
  validateWithZodSchema,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";

import { z } from "zod";

/**
 * Rules for validating round starting in a game
 */
const roundStartRules = {
  /**
   * Checks if the latest round is in SETUP state
   * @param game - The current game state
   * @returns true if the latest round exists and is in SETUP state
   */
  isLatestRoundInSetupState(game: GameAggregate): boolean {
    const latestRound = complexProperties.getLatestRound(game);
    return latestRound !== null && latestRound.status === ROUND_STATE.SETUP;
  },

  /**
   * Checks if cards have been dealt for the round
   * @param game - The current game state
   * @returns true if the latest round has cards
   */
  hasCardsDealt(game: GameAggregate): boolean {
    const latestRound = complexProperties.getLatestRound(game);
    return (
      latestRound !== null &&
      latestRound.cards !== undefined &&
      latestRound.cards.length > 0
    );
  },

  /**
   * Checks if game is in progress state
   * @param game - The current game state
   * @returns true if the game is in IN_PROGRESS state
   */
  isGameInProgressState(game: GameAggregate): boolean {
    return game.status === GAME_STATE.IN_PROGRESS;
  },
};

/**
 * Base schema for round start validation
 */
const roundStartSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: roundSchema
    .extend({
      status: z.literal(ROUND_STATE.SETUP),
    })
    .required(),
});

/**
 * Enhanced schema that includes rules for round starting validation
 */
const roundStartAllowedSchema = roundStartSchema
  .refine(roundStartRules.isLatestRoundInSetupState, {
    message: "Latest round must be in SETUP state to start the round",
    path: ["currentRound", "status"],
  })
  .refine(roundStartRules.hasCardsDealt, {
    message: "Cards must be dealt before starting the round",
    path: ["currentRound", "cards"],
  })
  .refine(roundStartRules.isGameInProgressState, {
    message: "Game must be in IN_PROGRESS state to start a round",
    path: ["status"],
  });

/**
 * Type definition for a valid game state during round start
 */
export type StartRoundValidGameState = ValidatedGameState<
  typeof roundStartAllowedSchema
>;

/**
 * Validates the game state for round starting
 * @param data - Unknown data to validate
 * @returns Validation result containing either valid game state or validation errors
 */
export function validate(
  data: unknown,
): GameplayValidationResult<StartRoundValidGameState> {
  return validateWithZodSchema(roundStartAllowedSchema, data);
}
