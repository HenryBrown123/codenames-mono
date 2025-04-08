import { generate } from "kysely-codegen";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env file");
}

async function main() {
  await generate({
    dialect: "postgres",
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
    outputFile: "backend/src/db/db.types.ts", // Change output path if needed
  });
}

main().catch((err) => {
  console.error("Kysely codegen failed:", err);
  process.exit(1);
});
