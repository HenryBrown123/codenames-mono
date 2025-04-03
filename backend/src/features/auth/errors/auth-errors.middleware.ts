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
  stack?: string;
  cause?: any;
  req?: Request;
};

export const authErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof UnexpectedAuthError || err instanceof NoResultError) {
    const errorResponse: ErrorResponse = {
      succces: false,
      error: "Unexpected error",
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = err.stack;
      errorResponse.error = err.message;
      errorResponse.cause = err.cause;
      errorResponse.req = req;
    }

    res.status(500).json(errorResponse);

    return;
  }
  next(err);
};
