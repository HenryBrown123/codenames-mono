import { z } from "zod";
import { LobbyAggregate } from "./lobby-state.types";

/**
 * Validation error for lobby operations
 */
export type LobbyValidationError = {
  path?: string[];
  message: string;
};

/**
 * Generic result type for lobby validation operations
 */
export type LobbyValidationResult<T> = 
  | { valid: true; data: T }
  | { valid: false; errors: LobbyValidationError[] };

/**
 * Base type for validated lobby states with branding
 */
export type ValidatedLobbyState<TBrand extends string> = LobbyAggregate & {
  _brand: TBrand;
};

/**
 * Helper function to validate data with Zod schema and transform to lobby validation result
 */
export function validateWithZodSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): LobbyValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { valid: true, data: result.data };
  }
  
  const errors: LobbyValidationError[] = result.error.errors.map((error) => ({
    path: error.path.map(String),
    message: context ? `${context}: ${error.message}` : error.message,
  }));
  
  return { valid: false, errors };
}

/**
 * Helper function to combine multiple validation results
 */
export function combineValidationResults<T>(
  results: LobbyValidationResult<any>[],
  data: T
): LobbyValidationResult<T> {
  const allErrors: LobbyValidationError[] = [];
  
  for (const result of results) {
    if (!result.valid) {
      allErrors.push(...result.errors);
    }
  }
  
  if (allErrors.length > 0) {
    return { valid: false, errors: allErrors };
  }
  
  return { valid: true, data };
}

/**
 * Helper function to create branded validation result
 */
export function createBrandedResult<TBrand extends string>(
  lobby: LobbyAggregate,
  brand: TBrand
): ValidatedLobbyState<TBrand> {
  return lobby as ValidatedLobbyState<TBrand>;
}