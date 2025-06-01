import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "express-jwt";
import { UnexpectedAuthError } from "./auth.errors";
import { NoResultError } from "kysely";

/**
 * Error response structure returned to clients
 */
type AuthErrorApiResponse = {
  succces: boolean;
  error: string;
  details?: { stack?: string; cause?: any; req?: Request };
};

/**
 * Middleware that handles authentication-specific errors
 *
 * This middleware catches domain-specific errors from the auth feature
 * and returns 500 code. 4xx client errors are returned by controllers
 * if relavent.
 *
 * It handles:
 * - UnexpectedAuthError: Internal auth service errors
 * - NoResultError: Database lookup failures
 * - UnauthorizedError: jwt token error
 *
 * Response is sanitized with additional information when in developmenet mode.
 *
 * Other errors are passed to the next error handler in the chain.
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errorResponse: AuthErrorApiResponse = {
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

  if (
    err instanceof UnexpectedAuthError ||
    err instanceof NoResultError ||
    UnauthorizedError
  ) {
    res.status(500).json(errorResponse);
    return;
  }

  next(err);
};
