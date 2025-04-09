import { Request, Response, NextFunction } from "express";
import { UnexpectedSetupError } from "./setup.errors";
import { NoResultError } from "kysely";

/**
 * Type definition for setup error API responses
 * Includes error details in development environment
 */
type SetupErrorApiResponse = {
  succces: boolean;
  error: string;
  details?: { stack?: string; cause?: any; req?: Request };
};

/**
 * Error handling middleware for setup-related errors
 * Processes UnexpectedSetupError and NoResultError with appropriate responses
 * Includes detailed error information in development environment
 *
 * @param err - The error object to be handled
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const setupErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errorResponse: SetupErrorApiResponse = {
    succces: false,
    error: "Unexpected error",
  };

  if (process.env.NODE_ENV === "development") {
    const errorDetails = {
      stack: err.stack,
      error: err.message,
      cause: err.cause,
      req: req,
    };

    errorResponse.details = errorDetails;
  }

  if (err instanceof UnexpectedSetupError || err instanceof NoResultError) {
    res.status(500).json(errorResponse);
    return;
  }
  err.cause;
  next(err);
};
