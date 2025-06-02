import { z, ZodSchema } from "zod";

/**
 * Type utility to create a branded type from a schema that validates GameAggregate..
 *
 * Can be used by actions to ensure that the input state has ben validated before its called.
 *
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
 * Runtime validation of gameplay state.
 *
 * If successful, returns a validated game state branded with ValidatedGameState<T> which
 * allows actions that require this type to be called. Casting is safe here as the data is validated
 * at runtime prior to cast.
 *
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
