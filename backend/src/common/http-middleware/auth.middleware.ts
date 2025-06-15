import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  auth?: {
    userId: number;
    username: string;
  };
}

export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => void;

export const authMiddleware = (jwtSecret: string): AuthMiddleware => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Try to get token from cookie first
      let token = req.cookies?.authToken;

      // Fallback to Authorization header if no cookie
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "No authentication token provided",
        });
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: number;
        username: string;
      };

      // Attach user info to request
      req.auth = {
        userId: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
  };
};
