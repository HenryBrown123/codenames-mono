import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { CODEBREAKER_OUTCOME, TurnOutcome } from "@codenames/shared/types";
import { z } from "zod";

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

/** Repository function types */
export type TurnsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<TurnResult[]>;

export type TurnFinder<T extends TurnId> = (
  identifier: T,
) => Promise<TurnResult | null>;

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
      .innerJoin("teams", "turns.team_id", "teams.id")
      .where("turns.round_id", "=", roundId)
      .select([
        "turns.id as turnId",
        "turns.round_id as roundId",
        "turns.team_id as teamId",
        "teams.team_name as teamName",
        "turns.status",
        "turns.guesses_remaining as guessesRemaining",
        "turns.created_at as createdAt",
        "turns.completed_at as completedAt",
      ])
      .orderBy("turns.created_at", "asc")
      .execute();

    const turnIds = turns.map((turn) => turn.turnId);

    if (turnIds.length === 0) {
      return [];
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

    // Create a lookup object indexed by turn ID... related objects can be
    // easily grouped and attached to the response object in 1 pass.
    const relatedTurnData: Record<number, TurnResult> = {};

    turns.forEach((turn) => {
      relatedTurnData[turn.turnId] = {
        _id: turn.turnId,
        _roundId: turn.roundId,
        _teamId: turn.teamId,
        teamName: turn.teamName,
        status: turn.status,
        guessesRemaining: turn.guessesRemaining,
        createdAt: turn.createdAt,
        completedAt: turn.completedAt,
        guesses: [],
      };
    });

    clues.forEach((clue) => {
      const turn = relatedTurnData[clue.turn_id];
      if (turn) {
        turn.clue = {
          _id: clue.id,
          _turnId: clue.turn_id,
          word: clue.word,
          number: clue.number,
          createdAt: clue.created_at,
        };
      }
    });

    guesses.forEach((guess) => {
      const turn = relatedTurnData[guess.turn_id];
      if (turn) {
        turn.guesses.push({
          _id: guess.id,
          _turnId: guess.turn_id,
          _playerId: guess.player_id,
          _cardId: guess.card_id,
          playerName: guess.playerName,
          outcome: outcomeSchema.parse(guess.outcome),
          createdAt: guess.created_at,
        });
      }
    });

    // Return results in original turn order
    return turns.map((turn) => relatedTurnData[turn.turnId]);
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
    // Get the basic turn data
    const turn = await db
      .selectFrom("turns")
      .innerJoin("teams", "turns.team_id", "teams.id")
      .where("turns.id", "=", turnId)
      .select([
        "turns.id as turnId",
        "turns.round_id as roundId",
        "turns.team_id as teamId",
        "teams.team_name as teamName",
        "turns.status",
        "turns.guesses_remaining as guessesRemaining",
        "turns.created_at as createdAt",
        "turns.completed_at as completedAt",
      ])
      .executeTakeFirst();

    if (!turn) return null;

    // Prepare the result structure
    const result: TurnResult = {
      _id: turn.turnId,
      _roundId: turn.roundId,
      _teamId: turn.teamId,
      teamName: turn.teamName,
      status: turn.status,
      guessesRemaining: turn.guessesRemaining,
      createdAt: turn.createdAt,
      completedAt: turn.completedAt,
      guesses: [],
    };

    // Fetch clue and guesses in parallel
    const [clue, guesses] = await Promise.all([
      // Get the clue for this turn
      db
        .selectFrom("clues")
        .where("turn_id", "=", turnId)
        .select(["id", "turn_id", "word", "number", "created_at"])
        .executeTakeFirst(),

      // Get guesses with player names
      db
        .selectFrom("guesses")
        .innerJoin("players", "guesses.player_id", "players.id")
        .where("guesses.turn_id", "=", turnId)
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

    if (clue) {
      result.clue = {
        _id: clue.id,
        _turnId: clue.turn_id,
        word: clue.word,
        number: clue.number,
        createdAt: clue.created_at,
      };
    }

    result.guesses = guesses.map((guess) => ({
      _id: guess.id,
      _turnId: guess.turn_id,
      _playerId: guess.player_id,
      _cardId: guess.card_id,
      playerName: guess.playerName,
      outcome: outcomeSchema.parse(guess.outcome),
      createdAt: guess.created_at,
    }));

    return result;
  };
