import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import db from "./db/index.js";
import { default as wordRouter } from "./routes/word-router.js";
import { default as gameRouter } from "./routes/game-router.js";
import { specs, swaggerUi } from "./swagger.js";

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();
const apiPort = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* Swagger - externally facing API Docs */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/* JSDocs - backend project docs */
// Serve static files from the "docs" directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/docs', express.static(path.join(__dirname, 'docs')));

/* api routes */
app.use("/api", wordRouter);
app.use("/api", gameRouter);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
