// src/features/gameplay/new-round/new-round.validation.ts

import { z } from "zod";
import { roundCreationAllowedSchema } from "./new-round.rules";
import {
  GameplayValidationResult,
  validateGameplayState,
} from "../state/validate-gameplay-state";

/**
 * Type for game state validated for round creation
 * Using a branded type pattern without a separate utility type
 */
export type NewRoundValidGameState = z.infer<
  typeof roundCreationAllowedSchema
> & {
  readonly __brand: "NewRoundValidGameState";
};

/**
 * Validates a game state for round creation specifically
 */
export function validateForRoundCreation(
  data: unknown,
): GameplayValidationResult<NewRoundValidGameState> {
  // Use the generic validation function with our specific branded type
  return validateGameplayState<NewRoundValidGameState>(
    roundCreationAllowedSchema,
    data,
  );
}
