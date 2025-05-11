import enBaseDeck from "./en_base_deck.json";
import esBaseDeck from "./es_base_deck.json";
import { Transaction } from "kysely";
import { DB } from "../../db/db.types";

const BASE_DECK_IDS = ["BASE"];

export const refreshBaseDecks = async (trx: Transaction<DB>): Promise<void> => {
  const decks = [enBaseDeck, esBaseDeck];

  try {
    console.log("Starting deck refresh...");

    // Delete existing base deck data
    const deleteResult = await trx
      .deleteFrom("decks")
      .where("deck", "in", BASE_DECK_IDS)
      .executeTakeFirst();

    console.log(
      `Deleted ${deleteResult.numDeletedRows || 0} existing deck entries`,
    );

    // Process each deck file
    for (const deckData of decks) {
      const rows = deckData.decks;

      // Validate the deck data structure
      if (!Array.isArray(rows) || rows.length === 0) {
        console.warn(`⚠️ No deck data found in deck file, skipping`);
        continue;
      }

      // Get language and deck info for logging
      const sampleCard = rows[0];
      const deckName = sampleCard?.deck || "unknown";
      const languageCode = sampleCard?.language_code || "unknown";

      console.log(
        `Refreshing deck '${deckName}' (language: ${languageCode}) with ${rows.length} cards...`,
      );

      try {
        // Insert all rows for this deck
        const insertResult = await trx
          .insertInto("decks")
          .values(rows)
          .executeTakeFirst();

        console.log(
          `✓ Successfully inserted ${insertResult.numInsertedOrUpdatedRows || rows.length} cards for deck '${deckName}'`,
        );
      } catch (deckError) {
        console.error(`❌ Error refreshing deck '${deckName}':`, deckError);
        throw deckError; // Re-throw to trigger transaction rollback
      }
    }

    console.log("✅ All base decks refreshed successfully");
  } catch (error) {
    console.error("❌ Error during deck refresh:", error);
    throw error; // This will cause the transaction to rollback
  }
};
