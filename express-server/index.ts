import express from "express";

import bodyParser from "body-parser";
// Body-Parser: Middleware to parse incoming request bodies

import cors from "cors";
// CORS: Middleware for enabling Cross-Origin Resource Sharing

import db from "./db/index.js";
import { wordRouter, gameRouter } from "./game/";
import { specs, swaggerUi } from "./swagger.js";

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();
const apiPort = 3000;

app.use(cors()); // CORS before other middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* Swagger - externally facing API Docs */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/* api routes */
app.use("/api", wordRouter);
app.use("/api", gameRouter);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
