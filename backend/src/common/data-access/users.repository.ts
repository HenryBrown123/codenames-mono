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
export type Username = string;

/** Entity data types */
export type UserData = {
  username: string;
  created_at: Date;
};

/** Input and result types */
export type UserInput = {
  username: string;
};

export type UserResult = {
  id: number;
  username: string;
  created_at: Date;
};

/** Generic repository function types */
export type UserFinder<T extends UserId | Username> = (
  identifier: T,
) => Promise<UserResult | null>;

export type UserCreator = (input: UserInput) => Promise<UserResult>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for finding users by username
 *
 * @param db - Database connection
 */
export const findByUsername =
  (db: Kysely<DB>): UserFinder<Username> =>
  /**
   * Retrieves user data using their username
   *
   * @param username - The user's username
   * @returns User data if found, null otherwise
   */
  async (username) => {
    const user = await db
      .selectFrom("users")
      .where("username", "=", username)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

/**
 * Creates a function for finding users by ID
 *
 * @param db - Database connection
 */
export const findById =
  (db: Kysely<DB>): UserFinder<UserId> =>
  /**
   * Retrieves user data using their ID
   *
   * @param userId - The user's ID
   * @returns User data if found, null otherwise
   */
  async (userId) => {
    const user = await db
      .selectFrom("users")
      .where("id", "=", userId)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

/**
 * Creates a function for creating new users
 *
 * @param db - Database connection
 */
export const createUser =
  (db: Kysely<DB>): UserCreator =>
  /**
   * Creates a new user in the database
   *
   * @param input - User creation parameters
   * @returns Created user data
   * @throws {UnexpectedRepositoryError} If user creation fails
   */
  async ({ username }) => {
    try {
      const newUser = await db
        .insertInto("users")
        .values({
          username,
          created_at: new Date(),
        })
        .returning(["id", "username", "created_at"])
        .executeTakeFirstOrThrow();

      return newUser;
    } catch (error) {
      throw new UnexpectedRepositoryError(
        `Failed to create user: ${username}`,
        {
          cause: error,
        },
      );
    }
  };
