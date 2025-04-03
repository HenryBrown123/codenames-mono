// src/app.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import {
  errorHandler,
  notFoundHandler,
} from "./infrastructure/http-middleware/error-handler.middleware";
import { initialize as initializeAuth } from "./features/auth";
// import { initialize as initializeGames } from './features/games';
// import { initialize as initializePlayers } from './features/players';
import { postgresDb } from "./infrastructure/db";
import dotenv from "dotenv";

/**
 * Initialize the Express application with all middleware and features
 */

dotenv.config({ path: "../.env" });

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize auth feature with JWT options
const auth = initializeAuth(app, postgresDb, {
  secret: process.env.JWT_SECRET || "your-secret-key",
  options: {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "codenames-app",
  },
});

// Initialize other features and pass auth middleware to them
// initializeGames(app, db, {
//   middleware: {
//     requireAuthentication: auth.middleware.requireAuthentication
//   }
// });

// initializePlayers(app, db, {
//   middleware: {
//     requireAuthentication: auth.middleware.requireAuthentication
//   }
// });

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// 404 handler for routes that don't match any endpoints
app.use(notFoundHandler);

// Global error handler - catches any errors not handled by feature-specific handlers
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start the server
httpServer.listen(PORT, () => {
  console.log(`${process.env.NODE_ENV} server running on port ${PORT}`);
});
