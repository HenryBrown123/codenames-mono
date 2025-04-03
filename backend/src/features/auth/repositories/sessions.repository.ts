import { Kysely } from "kysely";
import { DB } from "src/infrastructure/db/db.types";

/**
 * Represents an authenticated user session
 */
export interface UserSession {
  userId: number;
  username: string;
  token: string;
}

/**
 * Authentication request payload
 */
export interface UserSessionRequest {
  username: string;
}

/**
 * Repository interface for authentication operations
 */
export interface AuthRepository {
  storeSession: (userId: number, token: string) => Promise<void>;
  invalidateSession: (userId: number) => Promise<void>;
}

/**
 * Dependencies required by the auth repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}

/**
 * Create an auth repository instance
 */
export const create = ({ db }: Dependencies): AuthRepository => {
  const storeSession = async (userId: number, token: string): Promise<void> => {
    // In a stateless JWT implementation, this is a no-op
    // For future expansion
    console.log(`Would store session for user ${userId}`);
    return Promise.resolve();
  };

  const invalidateSession = async (userId: number): Promise<void> => {
    // In a stateless JWT implementation, this is a no-op
    // For future expansion
    console.log(`Would invalidate sessions for user ${userId}`);
    return Promise.resolve();
  };

  return {
    storeSession,
    invalidateSession,
  };
};
