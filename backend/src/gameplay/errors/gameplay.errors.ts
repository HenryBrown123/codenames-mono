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

/**
 * Thrown when an action's business rule validation fails
 * Indicates the game state doesn't allow this action
 */
export class GameplayValidationError extends UnexpectedGameplayError {
  constructor(
    action: string,
    validationErrors: { path: string; message: string }[],
    options?: ErrorOptions,
  ) {
    const errorSummary = validationErrors.map((e) => e.message).join(", ");
    super(`Cannot ${action}: ${errorSummary}`, options);
    this.name = "GameplayValidationError";
    Object.setPrototypeOf(this, GameplayValidationError.prototype);
  }
}
