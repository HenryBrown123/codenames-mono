import Game from "../models/game-model.js";
import { createNewGame } from "../services/new-game-service.js";
import { executeTurn } from "../services/gameplay/service.js";

/**
 * Asynchronous function for returning a new game as a JSON object.
 *
 * @async
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params.gameSettings {Object} Optional param containing setting for the new game
 *
 */

export const getNewGame = async (req, res) => {
  console.log("New game request received");

  const gameSettings = req.body || {};

  try {
    console.log("About to create new game...");
    const newGame = await createNewGame(gameSettings);
    console.log(newGame);
    res.status(200).json({ success: true, newgame: newGame });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Asynchronous function for returning an existing game as a JSON object.
 *
 * @async
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params._id {String} game id for requested game
 *
 */

export const getGame = async (req, res) => {
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
  } catch (error) {
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
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params._id {String} game id for requested game
 *
 */

export const processTurn = async (req, res) => {
  const id = req.params._id;
  const updatedGameObject = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "ID parameter is missing" });
  }

  try {
    const outputGameObject = await executeTurn(updatedGameObject);

    if (!outputGameObject) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }

    return res.status(200).json({ success: true, game: outputGameObject });
  } catch (error) {
    console.error("Error processing gmae turn:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
