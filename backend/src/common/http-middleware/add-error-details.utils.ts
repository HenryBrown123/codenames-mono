import { Request } from "express";

export type ErrorDetailField = "error" | "cause" | "reqBody" | "stack";

export type AdditionalErrorDetails = {
  error: string;
  cause: unknown;
  reqBody: unknown;
  stack: Record<string, string>;
};

/**
 * Generates standardized error details for API responses
 *
 * @param err - The error object
 * @param req - Express request object
 * @param exclude - Optional array of field names to exclude from the result
 * @returns Object containing error details
 */
export const generateAdditionalErrorInfo = (
  err: Error,
  req: Request,
  exclude: ErrorDetailField[] = [],
): Partial<AdditionalErrorDetails> => {
  const result: Partial<AdditionalErrorDetails> = {};

  if (!exclude.includes("error")) {
    result.error = err.message;
  }

  if (!exclude.includes("cause")) {
    result.cause = err.cause;
  }

  if (!exclude.includes("reqBody")) {
    result.reqBody = req.body;
  }

  if (!exclude.includes("stack") && err.stack) {
    result.stack = Object.fromEntries(
      err.stack.split("\n").map((value, index) => {
        return [index.toString(), value];
      }),
    );
  }

  return result;
};
