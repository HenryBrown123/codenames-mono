import express from "express";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./common/http-middleware/error-handler.middleware";
import * as postgresDb from "./common/db";
import { createOpenApiSpec } from "@codenames/shared/api";
import { loadEnvFromPackageDir } from "./common/config";
import swaggerUi from "swagger-ui-express";

import { initialize as initializeAuth } from "./auth";
import { initialize as initializeUsers } from "./users";
import { initialize as initializeGameSetup } from "./setup";
import { initialize as initializeLobby } from "./lobby";
import { initialize as initializeGameplay } from "./gameplay";
import { initialize as initializeAI } from "./ai";
import { initialize as initializeChat } from "./chat";

import { authMiddleware } from "@backend/common/http-middleware/auth.middleware";
import { refreshSystemData } from "./common/data/system-data-loader";
import { initializeWebSocketServer } from "./common/websocket";

/**
 * Runtime validation of env. variables
 */
let env;
try {
  env = loadEnvFromPackageDir();
} catch (error) {
  console.error("Exiting procces due to invalid environmental variables.");
  process.exit(1);
}

/**
 * Initialize the Express application with all middleware and features
 */

const app = express();
const dbInstance = await postgresDb.initializeDb(env.DATABASE_URL);

/**
 * Refresh system data from json files.
 */
try {
  refreshSystemData(dbInstance);
} catch (error) {
  console.error(error);
  console.error("Exiting process as failed to refresh system data");
}

// CORS configuration that allows credentials
const corsOptions = {
  origin: [
    "http://localhost:8000", // Your frontend dev server
    "http://127.0.0.1:8000",
    "http://localhost:3000", // In case you run frontend on 3000
    "http://127.0.0.1:3000",
    "http://192.168.1.156:8000",
  ],
  credentials: true, // Essential for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie",
    "Access-Control-Allow-Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
};

// Configure general middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Swagger docs
const swaggerSpec = createOpenApiSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// this is the auth middleware handlers to be injected into features
const authHandlers = authMiddleware(env.JWT_SECRET);

// Initialize auth feature with JWT options
const auth = initializeAuth(app, dbInstance, {
  secret: env.JWT_SECRET,
  options: {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "codenames-app",
  },
});

// Initialize features
initializeUsers(app, dbInstance, {
  secret: env.JWT_SECRET,
  options: {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "codenames-app",
  },
});
const setup = initializeGameSetup(app, dbInstance, authHandlers);
const lobby = initializeLobby(app, dbInstance, authHandlers);
const { giveClueService, makeGuessService, endTurnService, getGameState } = initializeGameplay(
  app,
  dbInstance,
  authHandlers,
);

const ai = initializeAI({
  app,
  db: dbInstance,
  auth: authHandlers,
  llmConfig: {
    ollamaUrl: env.LLM_URL,
    model: env.LLM_MODEL,
    temperature: env.LLM_TEMPERATURE,
  },
  giveClue: giveClueService,
  makeGuess: makeGuessService,
  endTurn: endTurnService,
  getGameState,
});

// Initialize chat feature
const chat = initializeChat({
  app,
  db: dbInstance,
  auth: authHandlers,
  getGameState,
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const httpServer = createServer(app);
const PORT = env.PORT || 3000;

// Initialize WebSocket server
initializeWebSocketServer({
  httpServer,
  jwtSecret: env.JWT_SECRET,
  corsOrigins: corsOptions.origin as string[],
});

httpServer.listen(PORT, () => {
  console.log(`✅ ${process.env.NODE_ENV} server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
  console.log(`🤖 AI players initialized with Ollama (${ai.llm.model})`);
});
