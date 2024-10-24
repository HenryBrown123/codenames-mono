import express, { Request, Response } from "express";
import {
  getRandomWord,
  createWord,
  getRandomWords,
  postWordArray,
} from "./word-ctrl";

const router = express.Router();

/**
 * @swagger
 * /api/randomWord:
 *   get:
 *     tags:
 *       - Words
 *     summary: Get a random word
 *     responses:
 *       200:
 *         description: A random word
 */
router.get("/randomWord", async (req: Request, res: Response) => {
  await getRandomWord(req, res);
});

/**
 * @swagger
 * /api/createWord:
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
router.post("/createWord", async (req: Request, res: Response) => {
  await createWord(req, res);
});

/**
 * @swagger
 * /api/randomWords:
 *   get:
 *     tags:
 *       - Words
 *     summary: Get a list of random words
 *     responses:
 *       200:
 *         description: A list of random words
 */
router.get("/randomWords", async (req: Request, res: Response) => {
  await getRandomWords(req, res);
});

/**
 * @swagger
 * /api/createWordArray:
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
router.post("/createWordArray", async (req: Request, res: Response) => {
  await postWordArray(req, res);
});

export default router;
