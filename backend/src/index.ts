import express from "express";
import cors from "cors";
import { createServer } from "http";
import {
  errorHandler,
  notFoundHandler,
} from "./infrastructure/http-middleware/error-handler.middleware";
import { initialize as initializeAuth } from "./features/auth";
import * as postgresDb from "./infrastructure/db";
import { createOpenApiSpec } from "@codenames/shared/api";
import { loadEnvFromPackageDir } from "./infrastructure/config";
import swaggerUi from "swagger-ui-express";

/**
 * Runtime validation of env. variables
 */
let env;
try {
  env = loadEnvFromPackageDir();
} catch (error) {
  process.exit(1);
}

/**
 * Initialize the Express application with all middleware and features
 */

const app = express();
const dbInstance = await postgresDb.initializeDb(env.DATABASE_URL);

// Configure general middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Swagger docs
const swaggerSpec = createOpenApiSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize auth feature with JWT options
const auth = initializeAuth(app, dbInstance, {
  secret: process.env.JWT_SECRET || "your-secret-key",
  options: {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "codenames-app",
  },
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const httpServer = createServer(app);
const PORT = env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`✅ ${process.env.NODE_ENV} server running on port ${PORT}`);
});
