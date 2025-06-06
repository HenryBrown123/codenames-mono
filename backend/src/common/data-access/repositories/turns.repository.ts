import { Kysely } from "kysely";
import { DB } from "../../db/db.types";
import { CODEBREAKER_OUTCOME, TurnOutcome } from "@codenames/shared/types";
import { z } from "zod";
import { UnexpectedRepositoryError } from "./repository.errors";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type TurnId = number;
export type RoundId = number;
export type TeamId = number;

/** Zod schema for validating outcome values from database */
export const outcomeSchema = z
  .enum([
    CODEBREAKER_OUTCOME.ASSASSIN_CARD,
    CODEBREAKER_OUTCOME.BYSTANDER_CARD,
    CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD,
    CODEBREAKER_OUTCOME.OTHER_TEAM_CARD,
  ])
  .nullable();

/** Standardized results returned from repository */
export type ClueResult = {
  _id: number;
  _turnId: number;
  word: string;
  number: number;
  createdAt: Date;
};

export type GuessResult = {
  _id: number;
  _turnId: number;
  _playerId: number;
  _cardId: number;
  playerName: string;
  outcome: TurnOutcome | null;
  createdAt: Date;
};

export type TurnResult = {
  _id: number;
  _roundId: number;
  _teamId: number;
  teamName: string;
  status: string;
  guessesRemaining: number;
  createdAt: Date;
  completedAt: Date | null;
  clue?: ClueResult;
  guesses: GuessResult[];
};

/** Input types */
export type ClueInput = {
  word: string;
  targetCardCount: number;
};

/** Repository function types */
export type TurnsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<TurnResult[]>;

export type TurnFinder<T extends TurnId> = (
  identifier: T,
) => Promise<TurnResult | null>;

export type ClueCreator = (
  turnId: TurnId,
  clue: ClueInput,
) => Promise<ClueResult>;

export type TurnGuessUpdater = (
  turnId: TurnId,
  guessesRemaining: number,
) => Promise<TurnResult>;

/**
 * ==================
 * SHARED HELPERS
 * ==================
 */

/**
 * Fetches clues and guesses for given turn IDs and returns structured data
 */
const fetchTurnRelatedData = async (
  db: Kysely<DB>,
  turnIds: number[],
): Promise<Record<number, { clue?: ClueResult; guesses: GuessResult[] }>> => {
  if (turnIds.length === 0) {
    return {};
  }

  const [clues, guesses] = await Promise.all([
    db
      .selectFrom("clues")
      .where("turn_id", "in", turnIds)
      .select(["id", "turn_id", "word", "number", "created_at"])
      .execute(),

    db
      .selectFrom("guesses")
      .innerJoin("players", "guesses.player_id", "players.id")
      .where("guesses.turn_id", "in", turnIds)
      .select([
        "guesses.id",
        "guesses.turn_id",
        "guesses.player_id",
        "guesses.card_id",
        "guesses.outcome",
        "guesses.created_at",
        "players.public_name as playerName",
      ])
      .orderBy("guesses.created_at", "asc")
      .execute(),
  ]);

  // Initialize lookup with empty guesses arrays
  const relatedData: Record<
    number,
    { clue?: ClueResult; guesses: GuessResult[] }
  > = {};
  turnIds.forEach((turnId) => {
    relatedData[turnId] = { guesses: [] };
  });

  // Map clues
  clues.forEach((clue) => {
    relatedData[clue.turn_id].clue = {
      _id: clue.id,
      _turnId: clue.turn_id,
      word: clue.word,
      number: clue.number,
      createdAt: clue.created_at,
    };
  });

  // Map guesses
  guesses.forEach((guess) => {
    relatedData[guess.turn_id].guesses.push({
      _id: guess.id,
      _turnId: guess.turn_id,
      _playerId: guess.player_id,
      _cardId: guess.card_id,
      playerName: guess.playerName,
      outcome: outcomeSchema.parse(guess.outcome),
      createdAt: guess.created_at,
    });
  });

  return relatedData;
};

/**
 * Standard query for fetching turn base data with correct field names
 */
const getTurnBaseData = (db: Kysely<DB>) =>
  db
    .selectFrom("turns")
    .innerJoin("teams", "turns.team_id", "teams.id")
    .select([
      "turns.id as _id",
      "turns.round_id as _roundId",
      "turns.team_id as _teamId",
      "teams.team_name as teamName",
      "turns.status",
      "turns.guesses_remaining as guessesRemaining",
      "turns.created_at as createdAt",
      "turns.completed_at as completedAt",
    ]);

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for adding clues to turns
 */
export const createClue =
  (db: Kysely<DB>): ClueCreator =>
  async (turnId, { word, targetCardCount }) => {
    try {
      const clue = await db
        .insertInto("clues")
        .values({
          turn_id: turnId,
          word,
          number: targetCardCount,
          created_at: new Date(),
        })
        .returning(["id", "turn_id", "word", "number", "created_at"])
        .executeTakeFirstOrThrow();

      return {
        _id: clue.id,
        _turnId: clue.turn_id,
        word: clue.word,
        number: clue.number,
        createdAt: clue.created_at,
      };
    } catch (error) {
      throw new UnexpectedRepositoryError(
        `Failed to create clue for turn ${turnId}`,
        { cause: error },
      );
    }
  };

/**
 * Creates a function for updating turn guess counts
 */
export const updateTurnGuesses =
  (db: Kysely<DB>): TurnGuessUpdater =>
  async (turnId, guessesRemaining) => {
    try {
      // Update the turn
      await db
        .updateTable("turns")
        .set({
          guesses_remaining: guessesRemaining,
          updated_at: new Date(),
        })
        .where("id", "=", turnId)
        .execute();

      // Get the updated turn data using shared query
      const turn = await getTurnBaseData(db)
        .where("turns.id", "=", turnId)
        .executeTakeFirstOrThrow();

      // Fetch related data
      const relatedData = await fetchTurnRelatedData(db, [turnId]);

      return {
        ...turn,
        ...relatedData[turnId],
      };
    } catch (error) {
      throw new UnexpectedRepositoryError(
        `Failed to update guesses for turn ${turnId}`,
        { cause: error },
      );
    }
  };

/**
 * Creates a function for retrieving turns by round ID
 */
export const getTurnsByRoundId =
  (db: Kysely<DB>): TurnsFinder<RoundId> =>
  async (roundId) => {
    const turns = await getTurnBaseData(db)
      .where("turns.round_id", "=", roundId)
      .orderBy("turns.created_at", "asc")
      .execute();

    if (turns.length === 0) {
      return [];
    }

    const turnIds = turns.map((turn) => turn._id);
    const relatedData = await fetchTurnRelatedData(db, turnIds);

    return turns.map((turn) => ({
      ...turn,
      ...relatedData[turn._id],
    }));
  };

/**
 * Creates a function for retrieving a turn by ID
 */
export const getTurnById =
  (db: Kysely<DB>): TurnFinder<TurnId> =>
  async (turnId) => {
    const turn = await getTurnBaseData(db)
      .where("turns.id", "=", turnId)
      .executeTakeFirst();

    if (!turn) return null;

    const relatedData = await fetchTurnRelatedData(db, [turnId]);

    return {
      ...turn,
      ...relatedData[turnId],
    };
  };
