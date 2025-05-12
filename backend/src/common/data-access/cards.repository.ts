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

/** Card types enum */
export const CARD_TYPE = {
  TEAM: "TEAM",
  BYSTANDER: "BYSTANDER",
  ASSASSIN: "ASSASSIN",
} as const;

export type CardType = (typeof CARD_TYPE)[keyof typeof CARD_TYPE];

/** Card data as stored in the database */
export type CardData = {
  id: number;
  round_id: number;
  word: string;
  card_type: CardType;
  team_id: number | null;
  selected: boolean;
};

/** Parameters for creating cards */
export type CardInput = {
  roundId: number;
  word: string;
  cardType: CardType;
  teamId?: number; // Optional, required only for TEAM cards
};

/** Standardized card data returned from repository */
export type CardResult = {
  id: number;
  roundId: number;
  word: string;
  cardType: CardType;
  teamId: number | null;
  selected: boolean;
};

/** Repository function types */
export type CardsFinder<T extends RoundId> = (
  identifier: T,
) => Promise<CardResult[]>;

export type CardsCreator = (cards: CardInput[]) => Promise<CardResult[]>;

export type CardUpdater = (
  cardIds: CardId[],
  updates: { selected?: boolean },
) => Promise<CardResult[]>;

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
      .select(["id", "round_id", "word", "card_type", "team_id", "selected"])
      .execute();

    return cards.map((card) => ({
      id: card.id,
      roundId: card.round_id,
      word: card.word,
      cardType: card.card_type as CardType,
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
      // Validate team card assignments
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
        round_id: card.roundId,
        word: card.word,
        card_type: card.cardType,
        team_id: card.teamId || null,
        selected: false,
      }));

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
        ])
        .execute();

      return insertedCards.map((card) => ({
        id: card.id,
        roundId: card.round_id,
        word: card.word,
        cardType: card.card_type as CardType,
        teamId: card.team_id,
        selected: card.selected,
      }));
    } catch (error) {
      if (error instanceof UnexpectedRepositoryError) {
        throw error;
      }
      throw new UnexpectedRepositoryError(`Failed to create cards for round.`, {
        cause: error,
      });
    }
  };

/**
 * Replaces the cards associated with a specific game round in the database.
 *
 * This function performs the operation within a database transaction to ensure
 * atomicity. It first deletes all existing cards for the specified game round
 * and then creates new cards based on the provided input.
 *
 * @param db - The Kysely database instance used to interact with the database.
 * @returns A function that takes the following parameters:
 *   - `roundId` - The ID of the game round whose cards are to be replaced.
 *   - `cards` - An array of card input objects representing the new cards to be added.
 *
 * @throws Will throw an error if the transaction fails or if the card creation process encounters an issue.
 */
export const replaceCards = (db: Kysely<DB>) => {
  return async (roundId: number, cards: CardInput[]) => {
    db.transaction().execute(async (trx) => {
      await trx.deleteFrom("cards").where("round_id", "=", roundId).execute();
      const insertedCards = await createCards(db)(cards);
      return insertedCards;
    });
  };
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

/**
 * Creates a function for getting cards by type for a round
 */
export const getCardsByTypeAndRound =
  (db: Kysely<DB>) =>
  /**
   * Retrieves cards of a specific type for a given round
   *
   * @param roundId - The round's ID
   * @param cardType - Type of cards to retrieve
   * @param teamId - Optional team ID filter (for TEAM cards)
   * @returns List of cards matching the criteria
   */
  async (
    roundId: number,
    cardType: CardType,
    teamId?: number,
  ): Promise<CardResult[]> => {
    let query = db
      .selectFrom("cards")
      .where("round_id", "=", roundId)
      .where("card_type", "=", cardType);

    // Add team filter if provided and card type is TEAM
    if (cardType === CARD_TYPE.TEAM && teamId !== undefined) {
      query = query.where("team_id", "=", teamId);
    }

    const cards = await query
      .select(["id", "round_id", "word", "card_type", "team_id", "selected"])
      .execute();

    return cards.map((card) => ({
      id: card.id,
      roundId: card.round_id,
      word: card.word,
      cardType: card.card_type as CardType,
      teamId: card.team_id,
      selected: card.selected,
    }));
  };
