/**
 * Represents unexpected errors that occur within the auth feature
 *
 * This error class is used to encapsulate authentication-related errors
 * that are unexpected or indicate system failures rather than invalid
 * user input.
 */
export class UnexpectedAuthError extends Error {
  /**
   * Creates a new UnexpectedAuthError
   *
   * @param message - Error message describing what went wrong
   * @param options - Standard Error options (cause, etc.)
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UnexpectedAuthError";
    Object.setPrototypeOf(this, UnexpectedAuthError.prototype);
  }
}
