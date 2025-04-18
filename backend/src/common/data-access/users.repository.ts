import { Kysely } from "kysely";
import { DB } from "../db/db.types";

/** User as stored in the database */
export type User = {
  id: number;
  username: string;
  created_at: Date;
};

/** Find user by username */
export const findByUsername =
  (db: Kysely<DB>) =>
  async (username: string): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("username", "=", username)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

/** Find user by ID */
export const findById =
  (db: Kysely<DB>) =>
  async (userId: number): Promise<User | null> => {
    const user = await db
      .selectFrom("users")
      .where("id", "=", userId)
      .select(["id", "username", "created_at"])
      .executeTakeFirst();

    return user || null;
  };

/** Create a new user */
export const createUser =
  (db: Kysely<DB>) =>
  async (username: string): Promise<User> => {
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
