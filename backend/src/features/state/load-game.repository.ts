import type { Kysely } from "kysely";
import type { DB } from "src/infrastructure/db/db.types";

/**
 * Represents the game data returned by the query.
 */
export interface GameData {
  id: number;
  created_at: Date;
  public_id: string;
  status: string;
}

/**
 * Function type for retrieving game data by public ID.
 * Given a public ID, returns a Promise resolving to GameData or undefined if not found.
 */
export type GetGameDataByPublicId = (
  publicId: string,
) => Promise<GameData | undefined>;

/**
 * Retrieves game data along with its status.
 *
 * @param db - The Kysely database instance.
 * @returns A function that takes a public ID and returns a Promise resolving to the game data or undefined.
 */
export const getGameDataByPublicId =
  (db: Kysely<DB>): GetGameDataByPublicId =>
  async (publicId: string) => {
    return await db
      .selectFrom("games")
      .innerJoin("game_status", "games.status_id", "game_status.id")
      .select([
        "games.id",
        "games.created_at",
        "games.public_id",
        "game_status.status_name as status",
      ])
      .where("games.public_id", "=", publicId)
      .executeTakeFirst();
  };
