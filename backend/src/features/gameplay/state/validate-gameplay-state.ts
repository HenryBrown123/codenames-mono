import { z } from "zod";

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
 * Generic validation function that preserves the type passed as a type parameter
 * data is branded to allow stricter compile time type safety for gameplay actions.
 */
export function validateGameplayState<T>(
  schema: z.ZodType,
  data: unknown,
): GameplayValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    // Return the data with the explicit type T
    return {
      valid: true,
      data: result.data as T,
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
