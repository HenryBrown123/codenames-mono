import { Request, Response, NextFunction } from "express";
import { GuestAuthRequest } from "./auth-types";

/**
 * Guest Authentication Middleware
 * This middleware initializes guest sessions and prevents users from impersonating others.
 * It assigns a unique session identifier if not already set.
 */
export function guestAuth(
  req: GuestAuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.session.guestId) {
    console.log("Generating a new guest session id");
    // Assign a unique identifier to the guest
    req.session.guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
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
  next: NextFunction
) {
  if (!req.session.guestId) {
    console.log("Unauthorized: No guest session found");
    res.status(401).json({ error: "Unauthorized: No guest session found" }); // Send the error response
    return; // Optional but helps ensure that `next()` isn't called
  }

  console.log(
    "Running requireGuestAuth middleware for guestId: ",
    req.session.guestId
  );
  next();
}
