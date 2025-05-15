import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";

import { GameAggregate, roundSchema } from "../state/gameplay-state.types";
import {
  gameplayBaseSchema,
  currentRoundSchema,
} from "../state/gameplay-state.types";
import { complexProperties } from "../state/gameplay-state.helpers";

import {
  validateGameState,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";

import { z } from "zod";

/**
 * Rules for validating card dealing in a game
 */
const cardDealingRules = {
  /**
   * Checks if the game has at least one round
   * @param game - The current game state
   * @returns true if the game has at least one round
   */
  hasRounds(game: GameAggregate): boolean {
    return complexProperties.getRoundCount(game) >= 1;
  },

  /**
   * Checks if the latest round is in SETUP state
   * @param game - The current game state
   * @returns true if the latest round exists and is in SETUP state
   */
  isLatestRoundInSetupState(game: GameAggregate): boolean {
    const latestRound = complexProperties.getLatestRound(game);
    // If there are rounds, there must be a latest round
    return latestRound !== null && latestRound.status === ROUND_STATE.SETUP;
  },

  /**
   * Checks if the game has at least 2 teams for proper gameplay
   * @param game - The current game state
   * @returns true if the game has at least 2 teams
   */
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
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.SETUP),
  }),
});

/**
 * Enhanced schema that includes rules for card dealing validation
 */
const cardDealingAllowedSchema = cardDealingSchema
  .refine(cardDealingRules.hasRounds, {
    message: "Game must have at least one round to deal cards",
    path: ["rounds"],
  })
  .refine(cardDealingRules.isLatestRoundInSetupState, {
    message: "Latest round must be in SETUP state to deal cards",
    path: ["rounds"],
  })
  .refine(cardDealingRules.hasMinimumTwoTeams, {
    message: "Game must have at least 2 teams to deal cards",
    path: ["teams"],
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
