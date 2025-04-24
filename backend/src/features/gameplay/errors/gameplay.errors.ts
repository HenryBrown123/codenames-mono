export class UnexpectedGameplayError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UnexpectedGameplayError";
    Object.setPrototypeOf(this, UnexpectedGameplayError.prototype);
  }
}
