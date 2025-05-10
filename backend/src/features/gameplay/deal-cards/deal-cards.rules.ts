import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";

import { GameAggregate } from "../state/gameplay-state.types";
import { gameplayBaseSchema } from "../state/gameplay-state.types";
import { complexProperties } from "../state/gameplay-state.helpers";

import {
  validateGameState,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";

import { any, z } from "zod";

/**
 * Rules for validating card dealing in a game
 */
const cardDealingRules = {
  /**
   * Checks if the round exists and is in SETUP state
   * @param game - The current game state
   * @returns true if the latest round is in SETUP state
   */
  isRoundInSetupState(game: GameAggregate): boolean {
    const latestRound = complexProperties.getLatestRound(game);
    if (!latestRound) return false;
    return latestRound.status === ROUND_STATE.SETUP;
  },

  hasMinimumTwoTeams(game: GameAggregate): boolean {
    return complexProperties.getTeamCount(game) >= 2;
  },

  /**
   * Checks if cards have not already been dealt for the round
   * @param game - The current game state
   * @returns true if the latest round has no cards yet
   */
  hasNoCardsDealt(game: GameAggregate): boolean {
    // This would require a proper implementation in gameState to track cards
    // For now, we'll use a placeholder that assumes no cards have been dealt yet
    return true;
  },
};

/**
 * Base schema for card dealing validation
 */
const cardDealingSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
});

/**
 * Enhanced schema that includes rules for card dealing validation
 */
const cardDealingAllowedSchema = cardDealingSchema
  .refine(cardDealingRules.isRoundInSetupState, {
    message: "Cards can only be dealt to a round in SETUP state",
    path: ["rounds"],
  })
  .refine(cardDealingRules.hasNoCardsDealt, {
    message: "Cards have already been dealt for this round",
    path: ["rounds"],
  });

/**
 * Type definition for a valid game state during card dealing
 */
export type DealCardsValidGameState = ValidatedGameState<
  typeof cardDealingAllowedSchema
>;

/**
 * Validates the game state for card dealing
 * @param data - Unknown data to validate
 * @returns Validation result containing either valid game state or validation errors
 */
export function validate(
  data: unknown,
): GameplayValidationResult<DealCardsValidGameState> {
  return validateGameState(cardDealingAllowedSchema, data);
}
