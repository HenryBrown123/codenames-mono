import { Kysely } from "kysely";
import { DB } from "../../common/db/db.types";

/**
 * Complete repository interface for user operations
 */
export interface UserRepository {
  findByUsername: (username: string) => Promise<User | null>;
  findById: (userId: number) => Promise<User | null>;
  createUser: (username: string) => Promise<User>;
}

/**
 * Dependencies required by the user repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}
/**
 * User entity as stored in the database
 */
export type User = {
  id: number;
  username: string;
  created_at: Date;
};

/**
 * Create a repository instance for user operations
 */
export const create = ({ db }: Dependencies): UserRepository => {
  /**
   * Finds a user by their username
   */
  const findByUsername = async (username: string): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("username", "=", username)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

  /**
   * Finds a user by their ID
   */
  const findById = async (userId: number): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("id", "=", userId)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

  /**
   * Creates a new user in the database
   */
  const createUser = async (username: string): Promise<User> => {
    const newUser = await db
      .insertInto("users")
      .values({
        username,
        created_at: new Date(),
      })
      .returning(["id", "username", "created_at"])
      .executeTakeFirstOrThrow();

    return newUser;
  };

  return {
    findByUsername,
    findById,
    createUser,
  };
};
