import { Request, Response, NextFunction } from "express";
import { GuestAuthRequest } from "@backend/auth/auth-types";
import GuestSessionModel from "@backend/auth/auth-guest-model";

/**
 * Guest Authentication Middleware
 * This middleware initializes guest sessions and prevents users from hijacking a game
 * It assigns a unique session identifier if not already set.
 */

export async function guestAuth(
  req: GuestAuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.guestId) {
    const guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
    req.session.guestId = guestId;

    // Create a new session in the database
    try {
      await GuestSessionModel.create({ guestId });
    } catch (error) {
      console.error("Failed to create session in DB:", error);
      res.status(500).json({ error: "Failed to create guest session" });
      return;
    }
  }

  next();
}

/**
 * Require Guest Authentication Middleware
 * This middleware ensures that a guest session exists.
 */
export function requireGuestAuth(
  req: GuestAuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.guestId) {
    console.log("Unauthorized: No guest session found");
    res.status(401).json({ error: "Unauthorized: No guest session found" }); // Send the error response
    return;
  }

  console.log(
    "Running requireGuestAuth middleware for guestId: ",
    req.session.guestId,
  );
  next();
}
