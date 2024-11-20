import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import db from "./db/index.js";
import { wordRouter, gameRouter } from "@game/index";
import { specs, swaggerUi } from "./swagger.js";
import { guestAuth, requireGuestAuth } from "@auth/guest-auth-middleware";
import { authRouter } from "@auth/auth-router.js";

// Environment Variables Setup
const apiPort = process.env.API_PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET || "default-secret"; // Make sure this is unique and strong in production

// Initialize Express App
const app = express();

// Middleware Setup
app.use(cors()); // Enable Cross-Origin Requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Middleware (for guest authentication)
app.use(
  session({
    secret: sessionSecret, // Replace with a stronger secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Use secure cookies in production (HTTPS required)
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/codenames", // MongoDB connection URL
    }),
  })
);

// Database Error Handling
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Health Check Endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* Swagger - Externally Facing API Docs */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Authentication Routes
app.use("/api/auth", guestAuth, authRouter);

// Apply guestAuth middleware for game routes that require a guest session
app.use("/api", requireGuestAuth, gameRouter);

/* API Routes */
app.use("/api", wordRouter);

/* Error Handling Middleware */
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

/* Start Listening */
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

export default app; // This is useful for testing
