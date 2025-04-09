import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { DB } from "./db.types";

const { Pool } = pg;

let dbInstance: Kysely<DB> | null = null;

/**
 * Initialize the database connection and test it
 * @param connectionString The PostgreSQL connection string
 * @returns A Promise resolving to the database instance
 * @throws Error if connection test fails
 */
export async function initializeDb(
  connectionString: string,
): Promise<Kysely<DB>> {
  if (dbInstance) throw new Error("Database already initialized");

  const pool = new Pool({
    connectionString,
  });

  try {
    const client = await pool.connect();
    client.release();
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
    throw error;
  }

  dbInstance = new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
  });

  return dbInstance;
}

export function getDb(): Kysely<DB> {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initializeDb first.");
  }
  return dbInstance;
}
