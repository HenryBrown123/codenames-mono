import { Kysely } from "kysely";
import { DB } from "@backend/db/db.types";

/**
 * User entity as stored in the database
 */
export interface User {
  id: number;
  username: string;
  created_at: Date;
}

/**
 * Repository interface for user management
 */
export interface UsersRepository {
  findByUsername: (username: string) => Promise<User | null>;
  createUser: (username: string) => Promise<User>;
  getById: (userId: number) => Promise<User | null>;
}

/**
 * Dependencies required by the users repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}

/**
 * Create a users repository instance
 */
export const create = ({ db }: Dependencies): UsersRepository => {
  const findByUsername = async (username: string): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("username", "=", username)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

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

  const getById = async (userId: number): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("id", "=", userId)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

  return {
    findByUsername,
    createUser,
    getById,
  };
};
