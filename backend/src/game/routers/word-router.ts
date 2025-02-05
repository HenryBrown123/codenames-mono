import express, { Request, Response } from "express";
import {
  getRandomWordHandler,
  createWord,
  getRandomWordsHandler,
  postWordArray,
} from "@backend/game/controllers/word-ctrl";

const router = express.Router();

/**
 * @swagger
 * /words/random:
 *   get:
 *     tags:
 *       - Words
 *     summary: Get a random word
 *     responses:
 *       200:
 *         description: A random word
 */
router.get("/words/random", async (req: Request, res: Response) => {
  await getRandomWordHandler(req, res);
});

/**
 * @swagger
 * /words:
 *   post:
 *     tags:
 *       - Words
 *     summary: Create a new word
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *     responses:
 *       201:
 *         description: Word created successfully
 */
router.post("/words", async (req: Request, res: Response) => {
  await createWord(req, res);
});

/**
 * @swagger
 * /words/random/array:
 *   get:
 *     tags:
 *       - Words
 *     summary: Get a list of random words
 *     parameters:
 *       - in: query
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of random words to fetch
 *     responses:
 *       200:
 *         description: A list of random words
 */
router.get("/words/random/array", async (req: Request, res: Response) => {
  await getRandomWordsHandler(req, res);
});

/**
 * @swagger&
 * /words/array:
 *   post:
 *     tags:
 *       - Words
 *     summary: Create an array of words
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 word:
 *                   type: string
 *     responses:
 *       201:
 *         description: Words created successfully
 */
router.post("/words/array", async (req: Request, res: Response) => {
  await postWordArray(req, res);
});

export default router;
