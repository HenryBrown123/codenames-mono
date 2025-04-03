import { Request, Response, NextFunction } from "express";
import { AuthError } from "../auth.service";

/**
 * Auth feature-specific error handler
 * Handles all auth-related domain errors
 */
export const authErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AuthError) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
    return;
  }

  next(err);
};
