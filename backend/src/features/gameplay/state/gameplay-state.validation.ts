import { z } from "zod";
import { GameAggregate, GameplaySchema } from "./gameplay-state.types";

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
 * Type utility to create a branded type from a schema that validates GameAggregate
 */
export type ValidatedGameState<T extends GameplaySchema> = z.infer<T> & {
  readonly __brand: unique symbol;
};

/**
 * Runtime validation of gameplay state
 */
export function validateGameState<T extends GameplaySchema>(
  schema: T,
  data: unknown,
): GameplayValidationResult<ValidatedGameState<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      valid: true,
      data: result.data as ValidatedGameState<T>,
    };
  } else {
    return {
      valid: false,
      errors: convertZodErrors(result.error),
    };
  }
}

function convertZodErrors(error: z.ZodError): GameplayValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}
