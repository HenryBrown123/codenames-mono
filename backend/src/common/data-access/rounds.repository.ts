import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { ROUND_STATE, RoundState } from "@codenames/shared/types";
import { z } from "zod";
import { roundSchema } from "@backend/features/gameplay/state/gameplay-state.validation";

/**
 * Result from creating or fetching a round
 */
export type RoundResult = {
  id: number;
  gameId: number;
  roundNumber: number;
  createdAt: Date;
  status?: RoundState;
};

/**
 * Zod schemas needed due to generated postgrest enum types returning "string" from Kysely query.
 * Other column primative types are typesafe through types generated through kysely-codegen.
 */
export const roundStatus = z.enum([
  ROUND_STATE.SETUP,
  ROUND_STATE.IN_PROGRESS,
  ROUND_STATE.COMPLETED,
]);

/**
 * Gets all rounds for a specific game
 */
export const getRoundsByGameId =
  (db: Kysely<DB>) =>
  async (gameId: number): Promise<RoundResult[]> => {
    const rounds = await db
      .selectFrom("rounds")
      .innerJoin("round_status", "rounds.status_id", "round_status.id")
      .where("rounds.game_id", "=", gameId)
      .select([
        "rounds.id",
        "rounds.game_id as gameId",
        "rounds.round_number as roundNumber",
        "round_status.status_name as status",
        "rounds.created_at as createdAt",
      ])
      .orderBy("rounds.round_number", "asc")
      .execute();

    const result = rounds.map((round) => {
      return {
        id: round.id,
        gameId: round.gameId,
        roundNumber: round.roundNumber,
        createdAt: round.createdAt,
      };
    });

    return result;
  };

/**
 * Creates a new round in the database
 */
export const createNewRound =
  (db: Kysely<DB>) =>
  async (gameId: number, roundNumber: number): Promise<RoundResult> => {
    // First get the SETUP status ID
    const statusResult = await db
      .selectFrom("round_status")
      .where("status_name", "=", "SETUP")
      .select(["id"])
      .executeTakeFirst();

    if (!statusResult) {
      throw new Error("Round status 'SETUP' not found in database");
    }

    // Create the round
    const result = await db
      .insertInto("rounds")
      .values({
        game_id: gameId,
        round_number: roundNumber,
        status_id: statusResult.id,
        created_at: new Date(),
      })
      .returning([
        "id",
        "game_id as gameId",
        "round_number as roundNumber",
        "created_at as createdAt",
      ])
      .executeTakeFirstOrThrow();

    return result;
  };

/**
 * Gets the latest round for a game
 */
export const getLatestRound =
  (db: Kysely<DB>) =>
  async (gameId: number): Promise<RoundResult | null> => {
    const round = await db
      .selectFrom("rounds")
      .innerJoin("round_status", "rounds.status_id", "round_status.id")
      .where("rounds.game_id", "=", gameId)
      .select([
        "rounds.id",
        "rounds.game_id as gameId",
        "rounds.round_number as roundNumber",
        "round_status.status_name as status",
        "rounds.created_at as createdAt",
      ])
      .orderBy("rounds.round_number", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!round) return null;

    const result = {
      id: round.id,
      gameId: round.gameId,
      roundNumber: round.roundNumber,
      createdAt: round.createdAt,
    };

    return result;
  };
