import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { ROUND_STATE, RoundState } from "@codenames/shared/types";
import { z } from "zod";
import { UnexpectedRepositoryError } from "./repository.errors";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** A unique identifier for a round */
export type RoundId = number;

/** A unique identifier for a game */
export type GameId = number;

/** Parameters for creating a new round */
export type RoundInput = {
  gameId: number;
  roundNumber: number;
};

/** Parameters for updating a round's status */
export type RoundStatusUpdateInput = {
  roundId: number;
  status: RoundState;
};

/** Standardized round data returned from repository */
export type RoundResult = {
  _id: number;
  _gameId: number;
  roundNumber: number;
  status: RoundState;
  createdAt: Date;
};

/** Function that finds multiple rounds by a specific identifier type */
export type RoundFinderAll<T extends GameId> = (
  identifier: T,
) => Promise<RoundResult[]>;

/** Function that finds a single round by a specific identifier type */
export type RoundFinder<T extends RoundId | GameId> = (
  identifier: T,
) => Promise<RoundResult | null>;

/** Function that creates a new round */
export type RoundCreator = ({
  gameId,
  roundNumber,
}: RoundInput) => Promise<RoundResult>;

/** Function that updates a round's status */
export type RoundStatusUpdater = ({
  roundId,
  status,
}: RoundStatusUpdateInput) => Promise<RoundResult>;

/**
 * ==================
 * VALIDATION SCHEMAS
 * ==================
 */

/**
 * Zod schema for round status validation
 */
export const roundStatusSchema = z.enum([
  ROUND_STATE.SETUP,
  ROUND_STATE.IN_PROGRESS,
  ROUND_STATE.COMPLETED,
]);

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for retrieving rounds by game ID
 */
export const getRoundsByGameId =
  (db: Kysely<DB>): RoundFinderAll<GameId> =>
  async (gameId) => {
    const rounds = await db
      .selectFrom("rounds")
      .innerJoin("round_status", "rounds.status_id", "round_status.id")
      .where("rounds.game_id", "=", gameId)
      .select([
        "rounds.id",
        "rounds.game_id",
        "rounds.round_number",
        "round_status.status_name",
        "rounds.created_at",
      ])
      .orderBy("rounds.round_number", "asc")
      .execute();

    return rounds.map((round) => ({
      _id: round.id,
      _gameId: round.game_id,
      roundNumber: round.round_number,
      status: roundStatusSchema.parse(round.status_name),
      createdAt: round.created_at,
    }));
  };

/**
 * Creates a function for retrieving a round by its ID
 */
export const getRoundById =
  (db: Kysely<DB>): RoundFinder<RoundId> =>
  async (roundId) => {
    const round = await db
      .selectFrom("rounds")
      .innerJoin("round_status", "rounds.status_id", "round_status.id")
      .where("rounds.id", "=", roundId)
      .select([
        "rounds.id",
        "rounds.game_id as gameId",
        "rounds.round_number as roundNumber",
        "round_status.status_name as status",
        "rounds.created_at as createdAt",
      ])
      .executeTakeFirst();

    return round
      ? {
          _id: round.id,
          _gameId: round.gameId,
          roundNumber: round.roundNumber,
          status: roundStatusSchema.parse(round.status),
          createdAt: round.createdAt,
        }
      : null;
  };

/**
 * Creates a function for retrieving the latest round for a game
 */
export const getLatestRound =
  (db: Kysely<DB>): RoundFinder<GameId> =>
  async (gameId) => {
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

    return round
      ? {
          _id: round.id,
          _gameId: round.gameId,
          roundNumber: round.roundNumber,
          status: roundStatusSchema.parse(round.status),
          createdAt: round.createdAt,
        }
      : null;
  };

/**
 * Creates a function for creating new rounds
 */
export const createNewRound =
  (db: Kysely<DB>): RoundCreator =>
  async ({ gameId, roundNumber }) => {
    return await db.transaction().execute(async (trx) => {
      const statusResult = await trx
        .selectFrom("round_status")
        .where("status_name", "=", ROUND_STATE.SETUP)
        .select(["id"])
        .executeTakeFirst();

      if (!statusResult) {
        throw new UnexpectedRepositoryError(
          `Round status '${ROUND_STATE.SETUP}' not found in database`,
        );
      }

      // Create the round
      const result = await trx
        .insertInto("rounds")
        .values({
          game_id: gameId,
          round_number: roundNumber,
          status_id: statusResult.id,
          created_at: new Date(),
        })
        .returning(["id", "game_id", "round_number", "created_at"])
        .executeTakeFirstOrThrow();

      return {
        _id: result.id,
        _gameId: result.game_id,
        roundNumber: result.round_number,
        status: ROUND_STATE.SETUP,
        createdAt: result.created_at,
      };
    });
  };

/**
 * Creates a function for updating a round's status
 */
export const updateRoundStatus =
  (db: Kysely<DB>): RoundStatusUpdater =>
  async ({ roundId, status }) => {
    try {
      return await db.transaction().execute(async (trx) => {
        // Get the status ID for the requested status
        const statusResult = await trx
          .selectFrom("round_status")
          .where("status_name", "=", status)
          .select(["id"])
          .executeTakeFirst();

        if (!statusResult) {
          throw new UnexpectedRepositoryError(
            `Round status '${status}' not found in database`,
          );
        }

        // Update the round's status
        const updatedRound = await trx
          .updateTable("rounds")
          .set({
            status_id: statusResult.id,
            updated_at: new Date(),
          })
          .where("id", "=", roundId)
          .returning([
            "id",
            "game_id as gameId",
            "round_number as roundNumber",
            "created_at as createdAt",
          ])
          .executeTakeFirstOrThrow();

        return {
          _id: updatedRound.id,
          _gameId: updatedRound.gameId,
          roundNumber: updatedRound.roundNumber,
          status: status,
          createdAt: updatedRound.createdAt,
        };
      });
    } catch (error) {
      if (error instanceof UnexpectedRepositoryError) {
        throw error;
      }
      throw new UnexpectedRepositoryError(
        `Failed to update status for round ${roundId}`,
        { cause: error },
      );
    }
  };
