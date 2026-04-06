import { Kysely } from "kysely";
import { DB } from "../db/db.types";
import { refreshBaseDecks } from "./decks/";
import { refreshEnums } from "./enums";
import type { AppLogger } from "../logging";

/**
 * Data refresh function to load application system data
 * 1. Delete all existing data from the tables
 * 2. Insert fresh data from the JSON files
 *
 * @param logger Application logger
 * @returns Function that accepts db connection
 */
export const refreshSystemData = (logger: AppLogger) => async (db: Kysely<DB>): Promise<void> => {
  const log = logger.for({ module: "system-data-loader" }).create();
  log.info("Starting data refresh");

  try {
    await db.transaction().execute(async (trx) => {
      await refreshBaseDecks(log)(trx);
      await refreshEnums(log)(trx);
    });

    log.info("Data refresh completed");
  } catch (error) {
    log.error("Data refresh failed", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
