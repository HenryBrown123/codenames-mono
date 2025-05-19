import { z, ZodSchema } from "zod";

/**
 * Type utility to create a branded type from a schema that validates GameAggregate
 */
export type ValidatedGameState<T extends ZodSchema> = z.infer<T> & {
  readonly __brand: unique symbol;
};

/**
 * Generic validation result type with discriminated union
 */
export type GameplayValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: GameplayValidationError[] };

/**
 * Represents a structured validation error in the gameplay feature
 */
export type GameplayValidationError = {
  path: string;
  message: string;
  code?: string;
};

/**
 * Runtime validation of gameplay state
 */
export function validateGameState<T extends z.ZodType>(
  schema: T,
  data: unknown,
): GameplayValidationResult<ValidatedGameState<T>> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      valid: false,
      errors: convertZodErrors(result.error),
    };
  }

  return {
    valid: true,
    data: result.data as ValidatedGameState<T>,
  };
}

function convertZodErrors(error: z.ZodError): GameplayValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}
