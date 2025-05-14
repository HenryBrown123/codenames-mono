import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { CODEBREAKER_OUTCOME, TurnOutcome } from "@codenames/shared/types";
import { z } from "zod"; // Make sure you import zod

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type TurnId = number;
export type RoundId = number;
export type TeamId = number;
export type ClueId = number;
export type GuessId = number;

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

/** Repository function types */
export type TurnsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<TurnResult[]>;

export type TurnFinder<T extends TurnId> = (
  identifier: T,
) => Promise<TurnResult | null>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for retrieving turns by round ID
 */
export const getTurnsByRoundId =
  (db: Kysely<DB>): TurnsFinder<RoundId> =>
  /**
   * Fetches all turns for a given round with their clues and guesses
   *
   * @param roundId - The round's ID
   * @returns List of turns with clues and guesses
   */
  async (roundId) => {
    const turns = await db
      .selectFrom("turns")
      .fullJoin("teams", "teams.id", "turns.team_id")
      .where("round_id", "=", roundId)
      .select([
        "id",
        "round_id",
        "team_id",
        "team_name",
        "status",
        "guesses_remaining",
        "created_at",
        "completed_at",
      ])
      .orderBy("created_at", "asc")
      .execute();

    // Fetch clues and guesses for all turns
    const turnIds = turns.map((turn) => turn.id);

    let clues: any[] = [];
    let guesses: any[] = [];

    if (turnIds.length > 0) {
      clues = await db
        .selectFrom("clues")
        .where("turn_id", "in", turnIds)
        .select(["id", "turn_id", "word", "number", "created_at"])
        .execute();

      guesses = await db
        .selectFrom("guesses")
        .where("turn_id", "in", turnIds)
        .select([
          "id",
          "turn_id",
          "player_id",
          "card_id",
          "outcome",
          "created_at",
        ])
        .orderBy("created_at", "asc")
        .execute();
    }

    // Map to result format
    return turns.map((turn) => {
      const turnClues = clues.filter((clue) => clue.turn_id === turn.id);
      const turnGuesses = guesses.filter((guess) => guess.turn_id === turn.id);

      const clueResult =
        turnClues.length > 0
          ? {
              _id: turnClues[0].id,
              _turnId: turnClues[0].turn_id,
              word: turnClues[0].word,
              number: turnClues[0].number,
              createdAt: turnClues[0].created_at,
            }
          : undefined;

      const guessResults = turnGuesses.map((guess) => ({
        _id: guess.id,
        _turnId: guess.turn_id,
        _playerId: guess.player_id,
        _cardId: guess.card_id,
        playerName: guess.player_name,
        outcome: outcomeSchema.parse(guess.outcome),
        createdAt: guess.created_at,
      }));

      return {
        _id: turn.id,
        _roundId: turn.round_id,
        _teamId: turn.team_id,
        status: turn.status,
        guessesRemaining: turn.guesses_remaining,
        createdAt: turn.created_at,
        completedAt: turn.completed_at,
        clue: clueResult,
        guesses: guessResults,
      };
    });
  };

/**
 * Creates a function for retrieving a turn by ID
 */
export const getTurnById =
  (db: Kysely<DB>): TurnFinder<TurnId> =>
  /**
   * Fetches a specific turn with its clues and guesses
   *
   * @param turnId - The turn's ID
   * @returns Turn data with clues and guesses or null if not found
   */
  async (turnId) => {
    const turn = await db
      .selectFrom("turns")
      .where("id", "=", turnId)
      .select([
        "id",
        "round_id",
        "team_id",
        "status",
        "guesses_remaining",
        "created_at",
        "completed_at",
      ])
      .executeTakeFirst();

    if (!turn) return null;

    // Fetch clue and guesses for the turn
    const clue = await db
      .selectFrom("clues")
      .where("turn_id", "=", turnId)
      .select(["id", "turn_id", "word", "number", "created_at"])
      .executeTakeFirst();

    const guesses = await db
      .selectFrom("guesses")
      .where("turn_id", "=", turnId)
      .select([
        "id",
        "turn_id",
        "player_id",
        "card_id",
        "outcome",
        "created_at",
      ])
      .orderBy("created_at", "asc")
      .execute();

    // Map to result format
    const clueResult = clue
      ? {
          _id: clue.id,
          _turnId: clue.turn_id,
          word: clue.word,
          number: clue.number,
          createdAt: clue.created_at,
        }
      : undefined;

    const guessResults = guesses.map((guess) => ({
      _id: guess.id,
      _turnId: guess.turn_id,
      _playerId: guess.player_id,
      _cardId: guess.card_id,
      outcome: outcomeSchema.parse(guess.outcome),
      createdAt: guess.created_at,
    }));

    return {
      _id: turn.id,
      _roundId: turn.round_id,
      _teamId: turn.team_id,
      status: turn.status,
      guessesRemaining: turn.guesses_remaining,
      createdAt: turn.created_at,
      completedAt: turn.completed_at,
      clue: clueResult,
      guesses: guessResults,
    };
  };

/**
 * Creates a function to get the latest turn for a round
 */
export const getLatestTurnByRoundId =
  (db: Kysely<DB>) =>
  /**
   * Fetches the most recent turn for a round
   *
   * @param roundId - The round's ID
   * @returns The latest turn or null if none exists
   */
  async (roundId: RoundId): Promise<TurnResult | null> => {
    const turn = await db
      .selectFrom("turns")
      .where("round_id", "=", roundId)
      .select([
        "id",
        "round_id",
        "team_id",
        "status",
        "guesses_remaining",
        "created_at",
        "completed_at",
      ])
      .orderBy("created_at", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!turn) return null;

    // Use the existing function to get full turn details
    return await getTurnById(db)(turn.id);
  };
