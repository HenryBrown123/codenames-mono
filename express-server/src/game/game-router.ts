import express, { Request, Response } from "express";
import { getGame, getNewGame, processTurn } from "./game-ctrl";

const router = express.Router();

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Creates a new game with specified or default settings.
 *     tags:
 *       - Gameplay
 *     requestBody:
 *       description: Optional settings for the new game
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numberOfCards:
 *                 type: integer
 *               startingWithTeam:
 *                 type: string
 *               numberOfAssassins:
 *                 type: integer
 *           example:
 *              numberOfCards: 25
 *              startingWithTeam: 'green'
 *              numberOfAssassins: 0
 *     responses:
 *       200:
 *         description: New game created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newgame:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       type: object
 *                       properties:
 *                         numberOfCards:
 *                           type: integer
 *                         startingTeam:
 *                           type: string
 *                         numberOfAssassins:
 *                           type: integer
 *                     state:
 *                       type: object
 *                       properties:
 *                         stage:
 *                           type: string
 *                         paused:
 *                           type: boolean
 *                         gameOver:
 *                           type: boolean
 *                         words:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               selected:
 *                                 type: boolean
 *                               _id:
 *                                 type: string
 *                               word:
 *                                 type: string
 *                               color:
 *                                 type: string
 *                     _id:
 *                       type: string
 *                     rounds:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           team:
 *                             type: string
 *                           codeword:
 *                             type: string
 *                           guesses_allowed:
 *                             type: integer
 *                           guessed_words:
 *                             type: integer
 *                     __v:
 *                       type: integer
 *                     red_score:
 *                       type: integer
 *                     green_score:
 *                       type: integer
 *                     id:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.post("/games", async (req: Request, res: Response) => {
  await getNewGame(req, res);
});

/**
 * @swagger
 * /games/{_id}:
 *   get:
 *     summary: Returns an existing game as a JSON object.
 *     tags:
 *       - Gameplay
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The ID of the game to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game:
 *                   type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal server error
 */
router.get("/games/:_id", async (req: Request, res: Response) => {
  await getGame(req, res);
});

/**
 * @swagger
 * /games/{_id}/turn:
 *   post:
 *     summary: Processes turn based on current game state and returns new game state
 *     tags:
 *       - Gameplay
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: The ID of the game to retrieve
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Optional settings for the new game
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Game object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game:
 *                   type: object
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Game not found
 *       500:
 *         description: Internal server error
 */
router.post("/games/:_id/turn", async (req: Request, res: Response) => {
  await processTurn(req, res);
});

export default router;
