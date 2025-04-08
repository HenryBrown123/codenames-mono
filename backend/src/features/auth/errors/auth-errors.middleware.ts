import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "express-jwt";
import { UnexpectedAuthError } from "./auth.errors";
import { NoResultError } from "kysely";

/**
 * Auth feature-specific error handler
 * Handles all auth-related domain errors
 */

type ErrorResponse = {
  succces: boolean;
  error: string;
  details?: { stack?: string; cause?: any; req?: Request };
};

export const authErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errorResponse: ErrorResponse = {
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

  if (err instanceof UnexpectedAuthError || err instanceof NoResultError) {
    res.status(500).json(errorResponse);
    return;
  }
  err.cause;
  next(err);
};
