// src/features/setup/setup.repository.ts
import { DB } from "src/common/db/db.types";
import { Kysely } from "kysely";

/**
 * Represents the game data returned by the query.
 */
export interface GameData {
  id: number;
  created_at: Date;
  public_id: string;
  status: string;
}

export interface GameRepository {
  getGameDataByPublicId: (publicId: string) => Promise<GameData | null>;
  createGame: (
    publicId: string,
    gameType: string,
    gameFormat: string,
  ) => Promise<{ id: number }>;
}

/**
 * Dependencies required by the repository
 */
export interface Dependencies {
  db: Kysely<DB>;
}

/**
 * Create a repository instance for game setup operations
 */
export const create = ({ db }: Dependencies): GameRepository => {
  /**
   * Retrieves game data along with its status.
   */
  const getGameDataByPublicId = async (publicId: string) => {
    const game = await db
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

    return game || null;
  };

  /**
   * Creates a new game with the provided configuration
   */
  const createGame = async (
    publicId: string,
    gameType: string,
    gameFormat: string,
  ) => {
    const insertedGame = await db
      .insertInto("games")
      .values({
        public_id: publicId,
        status_id: 1,
        created_at: new Date(),
        game_type: gameType,
        game_format: gameFormat,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    return insertedGame;
  };

  return {
    createGame,
    getGameDataByPublicId,
  };
};
