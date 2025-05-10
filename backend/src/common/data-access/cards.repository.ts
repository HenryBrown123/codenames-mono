import { Kysely, sql } from "kysely";
import { DB } from "../db/db.types";
import { UnexpectedRepositoryError } from "./repository.errors";

/**
 * ==================
 * REPOSITORY TYPES
 * ==================
 */

/** Domain-specific identifier types */
export type CardId = number;
export type RoundId = number;
export type TeamId = number;
export type DeckId = number;

/** Card data as stored in the database */
export type CardData = {
  id: number;
  round_id: number;
  word: string;
  team_id: number;
  selected: boolean;
};

/** Parameters for creating cards */
export type CardInput = {
  roundId: number;
  word: string;
  teamId: number;
};

/** Standardized card data returned from repository */
export type CardResult = {
  id: number;
  roundId: number;
  word: string;
  teamId: number;
  selected: boolean;
};

/** Repository function types */
export type CardsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<CardResult[]>;

export type CardsCreator = (cards: CardInput[]) => Promise<CardResult[]>;

export type RandomWordsSelector = (
  count: number,
  deck?: string,
  languageCode?: string,
) => Promise<string[]>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

/**
 * Creates a function for retrieving cards by round ID
 */
export const getCardsByRoundId =
  (db: Kysely<DB>): CardsFinder<RoundId> =>
  /**
   * Fetches all cards for a given round
   *
   * @param roundId - The round's ID
   * @returns List of cards in the round
   */
  async (roundId) => {
    const cards = await db
      .selectFrom("cards")
      .where("round_id", "=", roundId)
      .select(["id", "round_id", "word", "team_id", "selected"])
      .execute();

    return cards.map((card) => ({
      id: card.id,
      roundId: card.round_id,
      word: card.word,
      teamId: card.team_id,
      selected: card.selected,
    }));
  };

/**
 * Creates a function for creating new cards for a round
 */
export const createCards =
  (db: Kysely<DB>): CardsCreator =>
  /**
   * Inserts new cards into the database
   *
   * @param cards - Array of card data to insert
   * @returns Newly created card records
   * @throws {UnexpectedRepositoryError} If insertion fails
   */
  async (cards) => {
    if (cards.length === 0) {
      return [];
    }

    try {
      const values = cards.map((card) => ({
        round_id: card.roundId,
        word: card.word,
        team_id: card.teamId,
        selected: false,
      }));

      const insertedCards = await db
        .insertInto("cards")
        .values(values)
        .returning(["id", "round_id", "word", "team_id", "selected"])
        .execute();

      return insertedCards.map((card) => ({
        id: card.id,
        roundId: card.round_id,
        word: card.word,
        teamId: card.team_id,
        selected: card.selected,
      }));
    } catch (error) {
      throw new UnexpectedRepositoryError(`Failed to create cards for round.`, {
        cause: error,
      });
    }
  };

/**
 * Creates a function for selecting random words from the decks table
 */
export const getRandomWords =
  (db: Kysely<DB>): RandomWordsSelector =>
  /**
   * Retrieves random words from the decks table
   *
   * @param count - Number of words to retrieve
   * @param languageCode - Optional language code filter (defaults to 'en')
   * @returns Array of random words
   * @throws {UnexpectedRepositoryError} If retrieving words fails
   */
  async (count, deck = "BASE", languageCode = "en") => {
    const words = await db
      .selectFrom("decks")
      .where("language_code", "=", languageCode)
      .where("deck", "=", deck)
      .select("word")
      .orderBy(sql<number>`random()`)
      .limit(count)
      .execute();

    if (words.length < count) {
      throw new UnexpectedRepositoryError(
        `Not enough words available. Requested ${count}, but only found ${words.length}`,
      );
    }

    return words.map((w) => w.word);
  };
