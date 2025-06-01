/**
 * Domain-specific error for gameplay operations
 * Used to differentiate gameplay errors from other feature errors for error handling middleware
 * and logging purposes.
 */
export class UnexpectedGameplayError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UnexpectedGameplayError";
    Object.setPrototypeOf(this, UnexpectedGameplayError.prototype);
  }
}
