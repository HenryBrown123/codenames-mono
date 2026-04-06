/**
 * Exhaustive check helper for switch statements over union types.
 * TypeScript will error at compile time if a case is unhandled.
 * Throws at runtime if somehow reached (should never happen).
 */
export const assertNever = (x: never): never => {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
};
