import { z } from "zod";

/**
 * Represents a structured validation error in the gameplay feature
 */
export type GameplayValidationError = {
  path: string; // Dot-notation path to the field with the error
  message: string; // Human-readable error message
  code?: string; // Optional error code for programmatic handling
};

/**
 * Generic validation result that preserves the inferred type from the Zod schema
 */
export type GameplayValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: GameplayValidationError[] };

/**
 * Validates data against a Zod schema and returns a type-safe result
 * The return type is properly inferred from the schema
 */
export function validateGameplayState<T extends z.ZodType<any, any, any>>(
  schema: T,
  data: unknown,
): GameplayValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  } else {
    return {
      valid: false,
      errors: convertZodErrors(result.error),
    };
  }
}
export type ValidateGameplay = typeof validateGameplayState;

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
