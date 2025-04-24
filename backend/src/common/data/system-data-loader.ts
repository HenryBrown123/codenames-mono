import { Kysely, Transaction } from "kysely";
import { DB } from "../db/db.types";
import { refreshBaseDecks } from "./decks/";
import { refreshEnums } from "./enums";

/**
 * Simple data refresh function to load application system data
 * 1. Delete all existing data from the tables
 * 2. Insert fresh data from the JSON files
 *
 * @param db Kysely database connection
 */
export async function refreshSystemData(db: Kysely<DB>): Promise<void> {
  console.log("Starting data refresh (delete and insert)...");

  try {
    await db.transaction().execute(async (trx) => {
      await refreshBaseDecks(trx);
      await refreshEnums(trx);
    });

    console.log("✅ Data refresh completed successfully");
  } catch (error) {
    console.error("❌ Error refreshing data:", error);
    throw error;
  }
}
