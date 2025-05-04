import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import {
  GameType,
  GameFormat,
  GAME_TYPE,
  GAME_FORMAT,
  GAME_STATE,
  GameState,
} from "@codenames/shared/types";

import { z } from "zod";
import { UnexpectedRepositoryError } from "./repository.errors";

/** Represents the game data returned by the query */
export type GameData = {
  id: number;
  created_at: Date;
  public_id: string;
  status: GameState;
  game_type: GameType;
  game_format: GameFormat;
};

/**
 * Zod schemas needed due to generated postgrest enum types returning "string" from Kysely query.
 * Other column primative types are typesafe through types generated through kysely-codegen.
 */
export const gameTypeSchema = z.enum([
  GAME_TYPE.SINGLE_DEVICE,
  GAME_TYPE.MULTI_DEVICE,
]);

export const gameFormatSchema = z.enum([
  GAME_FORMAT.QUICK,
  GAME_FORMAT.BEST_OF_THREE,
  GAME_FORMAT.ROUND_ROBIN,
]);

export const gameStateSchema = z.enum([
  GAME_STATE.LOBBY,
  GAME_STATE.PAUSED,
  GAME_STATE.IN_PROGRESS,
  GAME_STATE.COMPLETED,
  GAME_STATE.ABANDONED,
]);

/** Game creation input */
export type GameInput = {
  publicId: string;
  gameType: GameType;
  gameFormat: GameFormat;
};

/** Game creation result */
export type GameResult = {
  id: number;
  created_at: Date;
};

/** Update game status input */
export type UpdateGameStatusInput = {
  gameId: number;
  statusId: number;
};

/** Retrieves game data by public ID */
export const getGameDataByPublicId =
  (db: Kysely<DB>) =>
  async (publicId: string): Promise<GameData | null> => {
    const game = await db
      .selectFrom("games")
      .innerJoin("game_status", "games.status_id", "game_status.id")
      .select([
        "games.id",
        "games.created_at",
        "games.public_id",
        "games.game_type",
        "games.game_format",
        "game_status.status_name as status",
      ])
      .where("games.public_id", "=", publicId)
      .executeTakeFirst();

    return game
      ? {
          id: game.id,
          created_at: game.created_at,
          public_id: game.public_id,
          status: gameStateSchema.parse(game.status),
          game_type: gameTypeSchema.parse(game.game_type),
          game_format: gameFormatSchema.parse(game.game_format),
        }
      : null;
  };

/** Creates a new game */
export const createGame =
  (db: Kysely<DB>) =>
  async (gameInput: GameInput): Promise<GameResult> => {
    const insertedGame = await db
      .insertInto("games")
      .values({
        public_id: gameInput.publicId,
        status_id: 1, // SETUP status
        created_at: new Date(),
        game_type: gameInput.gameType,
        game_format: gameInput.gameFormat,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    return {
      id: insertedGame.id,
      created_at: insertedGame.created_at,
    };
  };

/** Updates a game's status */
export const updateGameStatus =
  (db: Kysely<DB>) =>
  /**
   * Updates a game's status in the database
   * @param input - Game status update data
   * @returns Updated game record
   */
  async (gameId: number, statusName: string): Promise<GameData> => {
    // Get the status_id corresponding to the status name
    const updatedGame = await db.transaction().execute(async (trx) => {
      const status = await trx
        .selectFrom("game_status")
        .where("status_name", "=", statusName)
        .select(["id"])
        .executeTakeFirstOrThrow();

      return await db
        .updateTable("games")
        .set({
          status_id: status.id,
          updated_at: new Date(),
        })
        .where("id", "=", gameId)
        .returning([
          "id",
          "created_at",
          "public_id",
          "game_type",
          "game_format",
        ])
        .executeTakeFirstOrThrow();
    });

    const gameWithStatus = {
      ...updatedGame,
      status: gameStateSchema.parse(statusName),
      game_type: gameTypeSchema.parse(updatedGame.game_type),
      game_format: gameFormatSchema.parse(updatedGame.game_format),
    };

    return gameWithStatus;
  };
