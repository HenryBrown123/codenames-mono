// src/features/gameplay/state/validate-gameplay-state.ts
import { z } from "zod";
import { GameAggregate } from "./gameplay-state.types";

/**
 * Represents a structured validation error in the gameplay feature
 */
export type GameplayValidationError = {
  path: string;
  message: string;
  code?: string;
};

/**
 * Generic validation result type with discriminated union
 */
export type GameplayValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: GameplayValidationError[] };

/**
 * Type utility to create a branded type from a Zod schema
 */
export type ValidatedGameState<SchemaType extends z.ZodType> =
  z.infer<SchemaType> &
    GameAggregate & {
      readonly __brand: unique symbol;
    };

/**
 * Validates game state data against a schema and returns a properly typed result
 */
export function validateGameState<SchemaType extends z.ZodType>(
  schema: SchemaType,
  data: unknown,
): GameplayValidationResult<ValidatedGameState<SchemaType>> {
  const result = schema.safeParse(data);

  if (result.success) {
    // Return the data with the branded type
    return {
      valid: true,
      data: result.data as ValidatedGameState<SchemaType>,
    };
  } else {
    return {
      valid: false,
      errors: convertZodErrors(result.error),
    };
  }
}

/**
 * Converts a Zod error into our application's GameplayValidationError format
 */
function convertZodErrors(error: z.ZodError): GameplayValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}
