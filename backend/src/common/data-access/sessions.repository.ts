import { Kysely } from "kysely";
import { DB } from "../../common/db/db.types";

/**
 * Repository interface for session operations
 */
export interface SessionRepository {
  storeSession: (userId: number, token: string) => Promise<void>;
  invalidateSession: (userId: number) => Promise<void>;
}

/**
 * Dependencies required by the session repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}
/**
 * Represents an authenticated user session
 */
export interface Session {
  userId: number;
  username: string;
  token: string;
}

/**
 * Create a repository instance for session operations
 * Note: With JWT, these might be no-ops unless you're tracking sessions server-side
 */
export const create = ({ db }: Dependencies): SessionRepository => {
  /**
   * Stores a session for a user
   * For JWT, this might be a no-op or could store in a sessions table for revocation
   */
  const storeSession = async (userId: number, token: string): Promise<void> => {
    // In a stateless JWT implementation, this might be a no-op
    // For future expansion (e.g., if you want to track sessions or implement revocation)
    console.log(`Would store session for user ${userId}`);
    return Promise.resolve();
  };

  /**
   * Invalidates all sessions for a user
   */
  const invalidateSession = async (userId: number): Promise<void> => {
    // In a stateless JWT implementation, this might be a no-op
    // For future expansion (e.g., implementing logout or token revocation)
    console.log(`Would invalidate sessions for user ${userId}`);
    return Promise.resolve();
  };

  return {
    storeSession,
    invalidateSession,
  };
};
