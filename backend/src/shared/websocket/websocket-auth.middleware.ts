import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";
import type { AppLogger } from "@backend/shared/logging";

/**
 * Extended socket interface with auth information
 */
export interface AuthenticatedSocket extends Socket {
  auth?: {
    userId: number;
    username: string;
  };
}

/**
 * WebSocket authentication middleware
 * Verifies JWT token from cookies or auth header
 */
export const createWebSocketAuthMiddleware = (jwtSecret: string, logger?: AppLogger) => {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      let token: string | undefined;

      // Try to get token from cookie first
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = parseCookie(cookieHeader);
        token = cookies.authToken;
      }

      // Fallback to Authorization header or auth query param
      if (!token) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        } else if (socket.handshake.auth.token) {
          // Socket.io client can pass token in auth object
          token = socket.handshake.auth.token;
        }
      }

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: number;
        username: string;
      };

      // Attach user info to socket
      socket.auth = {
        userId: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (error) {
      logger?.warn(`websocket_auth_error: ${error instanceof Error ? error.message : "unknown"}`);
      next(new Error("Invalid or expired token"));
    }
  };
};
