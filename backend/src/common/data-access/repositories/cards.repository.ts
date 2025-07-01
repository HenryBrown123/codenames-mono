import { Kysely, sql } from "kysely";
import { DB } from "../../db/db.types";
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

/** Card types enum */
export const CARD_TYPE = {
  TEAM: "TEAM",
  BYSTANDER: "BYSTANDER",
  ASSASSIN: "ASSASSIN",
} as const;

export type CardType = (typeof CARD_TYPE)[keyof typeof CARD_TYPE];

/** Card data as stored in the database */
export type CardData = {
  _id: number;
  _round_id: number;
  _team_id: number | null;
  teamName: string | null;
  selected: boolean;
  word: string;
  card_type: CardType;
};

/** Parameters for creating cards */
export type CardInput = {
  word: string;
  cardType: CardType;
  teamId?: number; // Optional, required only for TEAM cards
};

/** Standardized card data returned from repository */
export type CardResult = {
  _id: number;
  _roundId: number;
  word: string;
  cardType: CardType;
  _teamId: number | null;
  teamName: string | null;
  selected: boolean;
};

/** Repository function types */
export type CardsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<CardResult[]>;

export type CardsCreator = (
  roundId: number,
  cards: CardInput[],
) => Promise<CardResult[]>;

export type CardUpdater = (
  cardIds: CardId[],
  updates: { selected?: boolean },
) => Promise<CardResult[]>;

export type RandomWordsSelector = (
  count: number,
  deck?: string,
  languageCode?: string,
  excludeWords?: string[],
) => Promise<string[]>;

/**
 * ==================
 * REPOSITORY FUNCTIONS
 * ==================
 */

// SQL expression for team name lookup - kept simple and contained
const teamNameLookup =
  sql<string>`(SELECT team_name FROM teams WHERE teams.id = cards.team_id)`.as(
    "team_name",
  );

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
      .leftJoin("teams", "cards.team_id", "teams.id")
      .where("cards.round_id", "=", roundId)
      .select([
        "cards.id",
        "cards.round_id",
        "cards.word",
        "cards.card_type",
        "cards.team_id",
        "cards.selected",
        "teams.team_name",
      ])
      .orderBy("cards.id", "asc")
      .execute();

    return cards.map((card) => ({
      _id: card.id,
      _roundId: card.round_id,
      _teamId: card.team_id,
      teamName: card.team_name,
      word: card.word,
      cardType: card.card_type as CardType,
      selected: card.selected,
    }));
  };

/**
 * Creates a function for creating new cards for a round
 */
export const createCards =
  (db: Kysely<DB>): CardsCreator =>
  /**
   * Inserts new cards into the database for a specific round
   *
   * @param roundId - The ID of the round to create cards for
   * @param cards - Array of card data to insert
   * @returns Newly created card records
   * @throws {UnexpectedRepositoryError} If insertion fails
   */
  async (roundId, cards) => {
    if (cards.length === 0) {
      return [];
    }

    try {
      for (const card of cards) {
        if (card.cardType === CARD_TYPE.TEAM && !card.teamId) {
          throw new UnexpectedRepositoryError(
            `Team card "${card.word}" must have a teamId`,
          );
        }
        if (card.cardType !== CARD_TYPE.TEAM && card.teamId) {
          throw new UnexpectedRepositoryError(
            `Non-team card "${card.word}" cannot have a teamId`,
          );
        }
      }

      const values = cards.map((card) => ({
        round_id: roundId,
        word: card.word,
        card_type: card.cardType,
        team_id: card.teamId || null,
        selected: false,
      }));

      // Use raw SQL to get the team names in the returning clause
      const insertedCards = await db
        .insertInto("cards")
        .values(values)
        .returning([
          "id",
          "round_id",
          "word",
          "card_type",
          "team_id",
          "selected",
          teamNameLookup,
        ])
        .execute();

      return insertedCards.map((card) => ({
        _id: card.id,
        _roundId: card.round_id,
        _teamId: card.team_id,
        teamName: card.team_name,
        word: card.word,
        cardType: card.card_type as CardType,
        selected: card.selected,
      }));
    } catch (error) {
      if (error instanceof UnexpectedRepositoryError) {
        throw error;
      }
      throw new UnexpectedRepositoryError(
        `Failed to create cards for round ${roundId}.`,
        {
          cause: error,
        },
      );
    }
  };

/**
 * Creates a function for replacing all cards for a round
 *
 * @param db - Database connection
 */
export const replaceCards =
  (db: Kysely<DB>): CardsCreator =>
  /**
   * Replaces all cards for a round within a transaction
   *
   * @param roundId - ID of the round to replace cards for
   * @param cards - New card data
   * @returns Newly created card records
   * @throws {UnexpectedRepositoryError} If operation fails
   */
  async (roundId, cards) => {
    try {
      await db
        .deleteFrom("cards")
        .where("round_id", "=", roundId)
        .executeTakeFirst();

      return await createCards(db)(roundId, cards);
    } catch (error) {
      throw new UnexpectedRepositoryError(
        `Failed to replace cards for round ${roundId}`,
        { cause: error },
      );
    }
  };

/**
 * Creates a function for updating cards (primarily for marking as selected)
 */
export const updateCards =
  (db: Kysely<DB>): CardUpdater =>
  /**
   * Updates specified cards with given data
   *
   * @param cardIds - Array of card IDs to update
   * @param updates - Object containing updates to apply
   * @returns Updated card records
   * @throws {UnexpectedRepositoryError} If update fails
   */
  async (cardIds, updates) => {
    if (cardIds.length === 0) {
      return [];
    }

    try {
      const updatedCards = await db
        .updateTable("cards")
        .set(updates)
        .where("id", "in", cardIds)
        .returning([
          "id",
          "round_id",
          "word",
          "card_type",
          "team_id",
          "selected",
          teamNameLookup,
        ])
        .execute();

      return updatedCards.map((card) => ({
        _id: card.id,
        _roundId: card.round_id,
        _teamId: card.team_id,
        teamName: card.team_name,
        word: card.word,
        cardType: card.card_type as CardType,
        selected: card.selected,
      }));
    } catch (error) {
      throw new UnexpectedRepositoryError(`Failed to update cards.`, {
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
   * @param deck - Deck identifier (defaults to "BASE")
   * @param languageCode - Optional language code filter (defaults to 'en')
   * @param excludeWords - Optional array of words to exclude from selection
   * @returns Array of random words
   * @throws {UnexpectedRepositoryError} If retrieving words fails
   */
  async (count, deck = "BASE", languageCode = "en", excludeWords?: string[]) => {
    let query = db
      .selectFrom("decks")
      .where("language_code", "=", languageCode)
      .where("deck", "=", deck);
    
    // Exclude words already in use
    if (excludeWords && excludeWords.length > 0) {
      query = query.where("word", "not in", excludeWords);
    }
    
    const words = await query
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
