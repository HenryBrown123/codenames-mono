import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { UnexpectedRepositoryError } from "./repository.errors";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type UserId = number;
export type SessionId = number;
export type Token = string;

/** Input and result types */
export type SessionInput = {
  userId: number;
  token: string;
  expiresAt?: Date;
};

export type SessionResult = {
  _id: number;
  _userId: number;
  username: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

/** Generic repository function types */
export type SessionFinder<T extends Token> = (
  identifier: T,
) => Promise<SessionResult | null>;

export type UserSessionFinder = (userId: UserId) => Promise<SessionResult[]>;

export type SessionCreator = (input: SessionInput) => Promise<SessionResult>;

export type SessionInvalidator = (token: Token) => Promise<boolean>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for storing new sessions
 *
 * @param db - Database connection
 */
export const storeSession =
  (db: Kysely<DB>): SessionCreator =>
  /**
   * Creates a new session for a user
   *
   * @param input - Session creation parameters
   * @returns Created session data
   * @throws {UnexpectedRepositoryError} If session creation fails
   */
  async ({ userId, token, expiresAt }) => {
    try {
      // Calculate expiration date if not provided (default: 7 days)
      const calculatedExpiresAt =
        expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Get the username for the user
      const user = await db
        .selectFrom("users")
        .where("id", "=", userId)
        .select(["username"])
        .executeTakeFirstOrThrow();

      // Insert the new session
      // Note: In a stateless JWT implementation, this might be simplified
      // or even just return a constructed object without DB insertion
      const session = {
        user_id: userId,
        token: token,
        expires_at: calculatedExpiresAt,
        created_at: new Date(),
      };

      // For future implementation - if you add a sessions table:
      // const newSession = await db
      //   .insertInto("sessions")
      //   .values(session)
      //   .returning(["id", "user_id", "token", "expires_at", "created_at"])
      //   .executeTakeFirstOrThrow();

      // Simulated result for stateless implementation
      return {
        _id: 0, // Placeholder ID for stateless implementation
        _userId: userId,
        username: user.username,
        token: token,
        expiresAt: calculatedExpiresAt,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new UnexpectedRepositoryError(
        `Failed to create session for user: ${userId}`,
        {
          cause: error,
        },
      );
    }
  };

/**
 * Creates a function for finding sessions by token
 *
 * @param db - Database connection
 */
export const findSessionByToken =
  (db: Kysely<DB>): SessionFinder<Token> =>
  /**
   * Retrieves session data using a token
   *
   * @param token - The session token
   * @returns Session data if found and valid, null otherwise
   */
  async (token) => {
    // For a stateless JWT implementation, this would verify the JWT
    // and return the decoded data or null if invalid

    // For future implementation with a sessions table:
    // const session = await db
    //   .selectFrom("sessions")
    //   .innerJoin("users", "sessions.user_id", "users.id")
    //   .where("sessions.token", "=", token)
    //   .where("sessions.expires_at", ">", new Date())
    //   .select([
    //     "sessions.id",
    //     "sessions.user_id as userId",
    //     "users.username",
    //     "sessions.token",
    //     "sessions.expires_at as expiresAt",
    //     "sessions.created_at as createdAt"
    //   ])
    //   .executeTakeFirst();

    // Placeholder for stateless implementation
    console.log(`Would validate JWT token: ${token}`);
    return null;
  };

/**
 * Creates a function for invalidating sessions
 *
 * @param db - Database connection
 */
export const invalidateSession =
  (db: Kysely<DB>): SessionInvalidator =>
  /**
   * Invalidates a specific session
   *
   * @param token - The session token to invalidate
   * @returns true if invalidated successfully, false otherwise
   */
  async (token) => {
    try {
      // For a stateless JWT implementation, this might be a no-op
      // or could add the token to a blocklist/revocation list

      // For future implementation with a sessions table:
      // await db
      //   .deleteFrom("sessions")
      //   .where("token", "=", token)
      //   .execute();

      console.log(`Would invalidate session with token: ${token}`);
      return true;
    } catch (error) {
      console.error("Error invalidating session:", error);
      return false;
    }
  };

/**
 * Creates a function for invalidating all sessions for a user
 *
 * @param db - Database connection
 */
export const invalidateUserSessions =
  (db: Kysely<DB>) =>
  /**
   * Invalidates all sessions for a specific user
   *
   * @param userId - The ID of the user whose sessions should be invalidated
   * @returns true if invalidated successfully, false otherwise
   */
  async (userId: number): Promise<boolean> => {
    try {
      // For a stateless JWT implementation, this might add all tokens
      // for this user to a blocklist/revocation list

      // For future implementation with a sessions table:
      // await db
      //   .deleteFrom("sessions")
      //   .where("user_id", "=", userId)
      //   .execute();

      console.log(`Would invalidate all sessions for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating user sessions:", error);
      return false;
    }
  };
