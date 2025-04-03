import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { DB } from "./db.types"; // npx kysely-codegen --out-file backend/src/db/db.types.ts

const { Pool } = pg;

export const postgresDb = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
