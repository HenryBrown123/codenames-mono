import {
  GAME_STATE,
  ROUND_STATE,
  MAX_ROUNDS_BY_FORMAT,
} from "@codenames/shared/types";

import { GameAggregate } from "../state/gameplay-state.types";
import { gameplayBaseSchema } from "../state/gameplay-state.types";
import { complexProperties } from "../state/gameplay-state.helpers";

import { roleAssignmentAllowedSchema } from "../assign-roles/assign-roles.rules";

import {
  validateWithZodSchema,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";

import { z } from "zod";

/**
 * Rules for validating round creation in the game
 */
const roundCreationRules = {
  /**
   * Checks if the previous round is completed
   * @param game - The current game state
   * @returns true if there is no previous round or if the previous round is completed
   */
  isPreviousRoundCompleted(game: GameAggregate): boolean {
    const latestRound = complexProperties.getLatestRound(game);
    if (!latestRound) return true;
    return latestRound.status === ROUND_STATE.COMPLETED;
  },

  /**
   * Checks if the game has not exceeded the maximum number of rounds
   * @param game - The current game state
   * @returns true if the current round count is less than the maximum allowed rounds
   */
  isWithinMaxRounds(game: GameAggregate): boolean {
    const currentRoundCount = complexProperties.getRoundCount(game);
    const maxRounds = MAX_ROUNDS_BY_FORMAT[game.game_format];
    return currentRoundCount < maxRounds;
  },
};

/**
 * Base schema for round creation validation
 */
const roundCreationSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
});

/**
 * Enhanced schema that includes rules for round creation validation
 */
const roundCreationAllowedSchema = roundCreationSchema
  .refine(roundCreationRules.isPreviousRoundCompleted, {
    message: "Previous round must be completed before creating a new round",
    path: ["rounds"],
  })
  .refine(roundCreationRules.isWithinMaxRounds, (game) => ({
    message: `Maximum of ${MAX_ROUNDS_BY_FORMAT[game.game_format]} rounds allowed for ${game.game_format} format`,
    path: ["rounds"],
  }));

/**
 * Type definition for a valid game state during round creation
 */
export type NewRoundValidGameState = ValidatedGameState<
  typeof roundCreationAllowedSchema
>;

/**
 * Validates the game state for round creation
 * @param data - Unknown data to validate
 * @returns Validation result containing either valid game state or validation errors
 */
export function validate(
  data: GameAggregate,
): GameplayValidationResult<NewRoundValidGameState> {
  return validateWithZodSchema(roundCreationAllowedSchema, data);
}
