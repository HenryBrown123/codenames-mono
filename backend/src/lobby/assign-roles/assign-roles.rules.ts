import { GAME_STATE, ROUND_STATE, PLAYER_ROLE } from "@codenames/shared/types";
import {
  GameAggregate,
  gameplayBaseSchema,
  roundSchema,
} from "../../gameplay/state/gameplay-state.types";
import {
  validateWithZodSchema,
  ValidatedGameState,
  GameplayValidationResult,
} from "../../gameplay/state/gameplay-state.validation";
import { z } from "zod";

/**
 * Rules for validating role assignment in a game
 */
const roleAssignmentRules = {
  /**
   * Checks if the round is in SETUP state and ready for role assignment
   */
  isRoundInSetupState(game: GameAggregate): boolean {
    return game.currentRound?.status === ROUND_STATE.SETUP;
  },

  /**
   * Checks if roles have not already been assigned
   */
  hasNoExistingRoles(game: GameAggregate): boolean {
    if (!game.currentRound?.players) return true;
    return game.currentRound.players.every(
      (player) => !player.role || player.role === PLAYER_ROLE.NONE,
    );
  },

  /**
   * Checks if each team has at least 2 players for role assignment
   */
  hasMinimumPlayersPerTeam(game: GameAggregate): boolean {
    return game.teams.every((team) => team.players.length >= 2);
  },
};

/**
 * Base schema for role assignment validation - use the full round schema
 */
export const roleAssignmentSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: roundSchema
    .extend({
      status: z.literal(ROUND_STATE.SETUP),
    })
    .required(),
});

/**
 * Enhanced schema that includes rules for role assignment validation
 */
export const roleAssignmentAllowedSchema = roleAssignmentSchema
  .refine(roleAssignmentRules.isRoundInSetupState, {
    message: "Round must be in SETUP state to assign roles",
    path: ["currentRound", "status"],
  })
  .refine(roleAssignmentRules.hasNoExistingRoles, {
    message: "Roles have already been assigned for this round",
    path: ["currentRound", "players"],
  })
  .refine(roleAssignmentRules.hasMinimumPlayersPerTeam, {
    message: "Each team must have at least 2 players to assign roles",
    path: ["teams"],
  });

/**
 * Type definition for a valid game state during role assignment
 */
export type AssignRolesValidGameState = ValidatedGameState<
  typeof roleAssignmentAllowedSchema
>;

/**
 * Validates the game state for role assignment
 */
export function validate(
  data: GameAggregate,
): GameplayValidationResult<AssignRolesValidGameState> {
  return validateWithZodSchema(roleAssignmentAllowedSchema, data);
}
