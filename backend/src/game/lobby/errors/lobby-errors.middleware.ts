import { Request, Response, NextFunction } from "express";
import { UnexpectedLobbyError } from "./lobby.errors";
import { NoResultError } from "kysely";
import { UnauthorizedError } from "express-jwt";
import { JsonObject } from "swagger-ui-express";
import { generateAdditionalErrorInfo } from "@backend/shared/http-middleware/add-error-details.helper";
import type { AppLogger } from "@backend/shared/logging";

/**
 * Type definition for lobby error API responses
 * Includes error details in development environment
 */
type LobbyErrorApiResponse = {
  succces: boolean;
  error: string;
  details?: { stack?: JsonObject; cause?: any; req?: Request };
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
export const lobbyErrorHandler = (logger: AppLogger) => (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errorResponse: LobbyErrorApiResponse = {
    succces: false,
    error: "Unexpected error",
  };

  if (process.env.NODE_ENV === "development") {
    const errorDetails = generateAdditionalErrorInfo(err, req);
    errorResponse.details = errorDetails;
  }

  logger.error(`${req.method} ${req.path}: ${err.message}`, errorResponse);

  if (err instanceof UnauthorizedError) {
    res.status(401).json(errorResponse);
    return;
  }

  if (err instanceof UnexpectedLobbyError || err instanceof NoResultError) {
    res.status(500).json(errorResponse);
    return;
  }

  next(err);
};
