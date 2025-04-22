import { Kysely } from "kysely";
import { DB } from "../db/db.types";

/** Input for creating a new round */
export type CreateRoundInput = {
  gameId: number;
  roundNumber: number;
};

/** Result of creating a new round */
export type RoundResult = {
  id: number;
  gameId: number;
  roundNumber: number;
  createdAt: Date;
};

/** Create a new round for a game */
export const createRound =
  (db: Kysely<DB>) =>
  async ({ gameId, roundNumber }: CreateRoundInput): Promise<RoundResult> => {
    const result = await db
      .insertInto("rounds")
      .values({
        game_id: gameId,
        round_number: roundNumber,
        created_at: new Date(),
      })
      .returning(["id", "game_id", "round_number", "created_at"])
      .executeTakeFirstOrThrow();

    return {
      id: result.id,
      gameId: result.game_id,
      roundNumber: result.round_number,
      createdAt: result.created_at,
    };
  };

/** Get the latest round for a game */
export const getLatestRound =
  (db: Kysely<DB>) =>
  async (gameId: number): Promise<RoundResult | null> => {
    const result = await db
      .selectFrom("rounds")
      .where("game_id", "=", gameId)
      .orderBy("round_number", "desc")
      .select(["id", "game_id", "round_number", "created_at"])
      .limit(1)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      gameId: result.game_id,
      roundNumber: result.round_number,
      createdAt: result.created_at,
    };
  };
