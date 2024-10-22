import express from 'express'; 

import bodyParser from 'body-parser'; 
// Body-Parser: Middleware to parse incoming request bodies

import cors from 'cors'; 
// CORS: Middleware for enabling Cross-Origin Resource Sharing

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

/* api routes */
app.use("/api", wordRouter);
app.use("/api", gameRouter);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
