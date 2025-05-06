import {
  GAME_STATE,
  ROUND_STATE,
  MAX_ROUNDS_BY_FORMAT,
} from "@codenames/shared/types";

import { gameplayBaseSchema } from "../state/gameplay-state.types";
import { GameAggregate } from "../state/gameplay-state.types";
import { gameAccessors } from "../state/gameplay-state.helpers";

import {
  validateGameState,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/validate-gameplay-state";

import { z } from "zod";

/**
 * Domain rules for creating a new round in a game
 */
const roundCreationRules = {
  /**
   * Checks if the previous round is properly completed and can be followed by a new round
   */
  isPreviousRoundCompleted(game: GameAggregate): boolean {
    const latestRound = gameAccessors.getLatestRound(game);
    // If no rounds exist, this rule passes
    if (!latestRound) return true;

    // Check the status of the latest round
    return latestRound.status === ROUND_STATE.COMPLETED;
  },

  /**
   * Verifies if the game hasn't reached its maximum allowed rounds
   */
  isWithinMaxRounds(game: GameAggregate): boolean {
    const currentRoundCount = gameAccessors.getRoundCount(game);
    const maxRounds = MAX_ROUNDS_BY_FORMAT[game.game_format];

    return currentRoundCount < maxRounds;
  },
};

/**
 * Game state schema with round creation constraints
 */
const roundCreationSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
});

/**
 * Complete schema with domain rule validations
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
 * Type for a valid round creation game state
 */
export type NewRoundValidGameState = ValidatedGameState<
  typeof roundCreationAllowedSchema
>;

/**
 * Validation function for game rules, wraps schema validation using specific round creation schema
 * that outputs a branded type.
 */
export function validate(
  data: unknown,
): GameplayValidationResult<NewRoundValidGameState> {
  return validateGameState(roundCreationAllowedSchema, data);
}
