import {
  GAME_STATE,
  ROUND_STATE,
  MAX_ROUNDS_BY_FORMAT,
} from "@codenames/shared/types";

import { gameplayBaseSchema } from "../state/gameplay-state.types";

import {
  GameplayValidationResult,
  validateGameplayState,
} from "../state/validate-gameplay-state";

import { z } from "zod";

/**
 * Type for game state validated for round creation
 * Using a branded type pattern to ensure type safety
 */
export type NewRoundValidGameState = z.infer<
  typeof roundCreationAllowedSchema
> & {
  readonly __brand: "NewRoundValidGameState";
};

/**
 * Validates a game state for round creation specifically
 * Returns a branded type when validation succeeds
 */
export function validate(
  data: unknown,
): GameplayValidationResult<NewRoundValidGameState> {
  return validateGameplayState<NewRoundValidGameState>(
    roundCreationAllowedSchema,
    data,
  );
}

/**
 * Schema specifically for validating a game state for round creation
 * Extends the base schema by narrowing the status field to only allow IN_PROGRESS
 */
const roundCreationSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
});

/**
 * Apply additional refinements for runtime validations that can't be expressed
 * in the type system alone
 */
const roundCreationAllowedSchema = roundCreationSchema
  // Latest round must be completed (if it exists)
  .refine(
    (game) => {
      if (!game.rounds || game.rounds.length === 0) return true;
      const latestRound = game.rounds[game.rounds.length - 1];
      return latestRound.status === ROUND_STATE.COMPLETED;
    },
    {
      message: "Previous round must be completed before creating a new round",
      path: ["rounds"],
    },
  )
  // Maximum rounds not reached
  .refine(
    (game) => {
      if (!game.rounds || game.rounds.length === 0) return true;
      return game.rounds.length < MAX_ROUNDS_BY_FORMAT[game.game_format];
    },
    (game) => {
      return {
        message: `Maximum of ${MAX_ROUNDS_BY_FORMAT[game.game_format]} rounds allowed for ${game.game_format} format`,
        path: ["rounds"],
      };
    },
  );
