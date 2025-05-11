import enBaseDeck from "./en_base_deck.json";
import esBaseDeck from "./es_base_deck.json";
import { Transaction } from "kysely";
import { DB } from "../../db/db.types";

const BASE_DECK_IDS = ["BASE"];

export const refreshBaseDecks = async (trx: Transaction<DB>): Promise<void> => {
  const decks = [enBaseDeck, esBaseDeck];

  await trx.deleteFrom("decks").where("deck", "in", BASE_DECK_IDS).execute();

  for (const deckData of decks) {
    const rows = deckData.decks;

    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn(`⚠️ No deck data found, skipping`);
      continue;
    }

    try {
      console.log(
        `Refreshing deck ${deckData.decks.at(-1)?.deck}, lang code ${deckData.decks.at(-1)?.language_code}`,
      );

      await trx.insertInto("decks").values(rows).execute();

      console.log(
        `....Successfully refreshed base deck with ${rows.length} rows`,
      );
    } catch (error) {
      console.error(`Error refreshing base deck:`, error);
      throw error;
    }
  }
};
