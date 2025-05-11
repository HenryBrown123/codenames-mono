import playerStatuses from "./player-statuses.json";
import gameStatuses from "./game-statuses.json";
import playerRoles from "./player-roles.json";
import { Transaction, sql } from "kysely";
import { DB } from "../../db/db.types";

const enums = [gameStatuses, playerStatuses, playerRoles];

export const refreshEnums = async (trx: Transaction<DB>) => {
  try {
    // Set all constraints to deferred for this transaction
    await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);

    console.log("Refreshing system enum data...");

    for (const enumData of enums) {
      for (const [tableName, rows] of Object.entries(enumData)) {
        if (!Array.isArray(rows) || rows.length === 0) {
          console.warn(
            `⚠️ Empty or invalid data for table ${tableName}, skipping`,
          );
          continue;
        }

        console.log(`Refreshing data for table '${tableName}'...`);

        // Delete all existing data (constraints will be checked at commit)
        await trx.deleteFrom(tableName as keyof DB).execute();

        // Insert fresh data
        await trx
          .insertInto(tableName as keyof DB)
          .values(rows as [] | {})
          .execute();

        console.log(
          `✓ Successfully refreshed table '${tableName}' with ${rows.length} rows`,
        );
      }
    }

    // Constraints will be checked automatically when transaction commits
    console.log("✅ All enum data refreshed successfully");
  } catch (error) {
    console.error("❌ Error refreshing enum data:", error);
    // The transaction will be rolled back automatically
    throw error;
  }
};
