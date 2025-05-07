import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { ROUND_STATE, RoundState } from "@codenames/shared/types";
import { z } from "zod";

/** Repository function types */
export type GetRoundsByGameIdFn = (gameId: number) => Promise<RoundResult[]>;
export type CreateRoundFn = (input: RoundInput) => Promise<RoundResult>;

export type UpdateRoundStatusFn = (
  roundId: number,
  status: RoundState,
) => Promise<RoundResult>;

/** Data types */
export type RoundResult = {
  id: number;
  gameId: number;
  roundNumber: number;
  status: RoundState;
  createdAt: Date;
};

export type RoundInput = {
  gameId: number;
  roundNumber: number;
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
        status: round.status as RoundState,
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
  async (input: RoundInput): Promise<RoundResult> => {
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
        game_id: input.gameId,
        round_number: input.roundNumber,
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

    return {
      id: result.id,
      gameId: result.gameId,
      roundNumber: result.roundNumber,
      status: ROUND_STATE.SETUP,
      createdAt: result.createdAt,
    };
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
      status: round.status as RoundState,
      createdAt: round.createdAt,
    };

    return result;
  };
