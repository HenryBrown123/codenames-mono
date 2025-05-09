import { Request, Response, NextFunction } from "express";
import { generateAdditionalErrorInfo } from "./add-error-details.helper";

type ErrorResponse = {
  success: boolean;
  error: string;
  details?: {};
};

/**
 * Global error handler middleware for Express
 * This is error middleware (4 parameters) that handles unexpected errors
 * Expected errors (400-level) should be handled by controllers
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(
    `Unexpected error processing request: ${req.method} ${req.path}`,
    err,
  );

  const errorResponse: ErrorResponse = {
    success: false,
    error: "An unexpected error occurred",
  };

  if (process.env.NODE_ENV === "development") {
    const errorDetails = generateAdditionalErrorInfo(err, req);
    errorResponse.details = errorDetails;
  }

  res.status(500).json(errorResponse);
};

/**
 * Middleware to handle 404 (Not Found) errors for routes that don't exist
 * This is regular middleware (3 parameters) that runs when no routes matched
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
};
