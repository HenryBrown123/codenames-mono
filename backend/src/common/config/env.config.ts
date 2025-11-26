import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { z } from "zod";

export const loadEnvFromPackageDir = () => {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.error(`❌ Error: No .env file found at: ${process.cwd()}`);
    throw new Error(
      "Missing .env file. Please create one with required environment variables.",
    );
  }

  console.log(`🔍 Loading environment variables from: ${envPath}`);
  dotenv.config({ path: envPath });

  // validate env variables against zod schema
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    result.error.errors.forEach((issue) => {
      console.error(`   • ${issue.path.join(".")}: ${issue.message}`);
    });
    console.error("Please check your .env file and correct all issues above.");
    throw result.error;
  }

  const parsedEnv = result.data;

  if (parsedEnv.NODE_ENV === "development") {
    console.log("📊 Environment Configuration:");
    console.log(`   • Environment: ${parsedEnv.NODE_ENV}`);
    console.log(`   • Port: ${parsedEnv.PORT}`);
    console.log(`   • Database: ${parsedEnv.DATABASE_URL}`);
    console.log(`   • JWT Secret: ${parsedEnv.JWT_SECRET}`);
    console.log(`   • LLM URL: ${parsedEnv.LLM_URL}`);
    console.log(`   • LLM Model: ${parsedEnv.LLM_MODEL}`);
    console.log(`   • LLM Temperature: ${parsedEnv.LLM_TEMPERATURE}`);
  }

  console.log("✅ Environment variables validated successfully");
  return parsedEnv;
};

// Zod schema for environment variables
const EnvSchema = z.object({
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NODE_ENV: z.enum(["development", "production", "test"]),
  LLM_PORT: z.string().transform(Number).default("11434"),
  LLM_URL: z.string().url("Invalid LLM_URL").default("http://localhost:11434"),
  LLM_MODEL: z.string().min(1, "LLM_MODEL must not be empty").default("qwen2.5:14b"),
  LLM_TEMPERATURE: z.string().transform(Number).default("0.7"),
});
