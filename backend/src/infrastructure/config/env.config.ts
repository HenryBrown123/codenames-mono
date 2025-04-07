import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Zod schema for environment variables
const EnvSchema = z.object({
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export function loadEnvFromPackageDir() {
  const uniqueEnvPaths = [path.resolve(process.cwd(), ".env")];

  // Find the first existing .env file
  const existingEnvFile = uniqueEnvPaths.find((p) => {
    const exists = fs.existsSync(p);
    return exists;
  });

  if (existingEnvFile) {
    console.log(`🔍 Loading environment variables from: ${existingEnvFile}`);
    dotenv.config({ path: existingEnvFile });
  } else {
    throw new Error(`No .env file could be found at: ${process.cwd()}`);
  }

  const parsedEnv = EnvSchema.parse(process.env);

  console.log("✅ Environment variables validated successfully");
  return parsedEnv;
}
