import { Request, Response } from "express";
import Game from "./game-model";
import { createNewGame } from "./services/new-game/new-game-service";
import { executeTurn } from "./services/gameplay/gameplay-service";

/**
 * Asynchronous function for returning a new game as a JSON object.
 *
 * @async
 * @param req {Request} Request object
 * @param res {Response} New game JSON
 * @param req.params.gameSettings {Object} Optional param containing setting for the new game
 */
export const getNewGame = async (req: Request, res: Response) => {
  console.log("New game request received");
  const gameSettings = req.body || {};
  try {
    const newGame = await createNewGame(gameSettings);
    res.status(200).json({ success: true, newgame: newGame });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
    console.log(error);
  }
};

/**
 * Asynchronous function for returning an existing game as a JSON object.
 *
 * @async
 * @param req {Request} Request object
 * @param res {Response} New game JSON
 * @param req.params._id {String} game id for requested game
 */
export const getGame = async (req: Request, res: Response) => {
  const id = req.params._id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "ID parameter is missing" });
  }
  try {
    const game = await Game.findOne({ _id: id });
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    return res.status(200).json({ success: true, game });
  } catch (error: any) {
    console.error("Error fetching game:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

/**
 * Asynchronous function for processing a turn and returning the updated game object to display in front end.
 *
 * @async
 * @param req {Request} Request object
 * @param res {Response} New game JSON
 * @param req.params._id {String} game id for requested game
 */
export const processTurn = async (req: Request, res: Response) => {
  const id = req.params._id;
  const inputGameState = req.body;
  console.log("Processing turn for game id: ", id);
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "ID parameter is missing" });
  }
  try {
    const outputGameState = await executeTurn(id, inputGameState);
    if (!outputGameState) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    return res.status(200).json({ success: true, game: outputGameState });
  } catch (error: any) {
    console.error("Error processing game turn:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
