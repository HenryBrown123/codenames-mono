import { Request, Response } from "express";
import Game from "@backend/game/models/game-model";
import { createNewGame } from "@backend/game/services/new-game/new-game-service";
import { executeTurn } from "@backend/game/services/gameplay/gameplay-service";
import { GameData, GameState } from "@codenames/shared/src";

/**
 * Common API response type.
 */
export interface ApiResponse<T> {
  success: boolean;
  game?: T;
  error?: string;
}

/**
 * Gameplay response object
 */
export interface GameResponseData {
  _id: string;
  state: GameState;
}

/**
 * Typed request for creating a new game.
 */
export interface NewGameRequest extends Request {
  body: Partial<{ gameSettings: any }>;
}

/**
 * Typed request for getting an existing game.
 */
export interface GetGameRequest extends Request {
  params: {
    _id: string;
  };
}

/**
 * Typed request for processing a game turn.
 */
export interface ProcessTurnRequest extends Request {
  params: {
    _id: string;
  };
  body: GameState;
}

/**
 * Asynchronous function for returning a new game as a JSON object.
 *
 * @async
 * @param req {NewGameRequest} Request object
 * @param res {Response} Response object
 */
export const getNewGame = async (req: NewGameRequest, res: Response) => {
  console.log("New game request received");
  const gameSettings = req.body.gameSettings || {};
  try {
    const newGame = await createNewGame(gameSettings);
    const response: ApiResponse<GameResponseData> = {
      success: true,
      game: newGame,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message,
    };
    res.status(500).json(response);
    console.log(error);
  }
};

/**
 * Asynchronous function for returning an existing game as a JSON object.
 *
 * @async
 * @param req {GetGameRequest} Request object
 * @param res {Response} Response object
 */
export const getGame = async (req: GetGameRequest, res: Response) => {
  const id = req.params._id;
  if (!id) {
    const response: ApiResponse<null> = {
      success: false,
      error: "ID parameter is missing",
    };
    return res.status(400).json(response);
  }
  try {
    const game = await Game.findOne({ _id: id });
    if (!game) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Game not found",
      };
      return res.status(404).json(response);
    }
    const response: ApiResponse<GameResponseData> = { success: true, game };
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching game:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Internal server error",
    };
    return res.status(500).json(response);
  }
};

/**
 * Asynchronous function for processing a turn and returning the updated game object to display in front end.
 *
 * @async
 * @param req {ProcessTurnRequest} Request object
 * @param res {Response} Response object
 */
export const processTurn = async (req: ProcessTurnRequest, res: Response) => {
  const id = req.params._id;
  const inputGameState: GameState = req.body;
  console.log("Processing turn for game id: ", id);
  if (!id) {
    const response: ApiResponse<null> = {
      success: false,
      error: "ID parameter is missing",
    };
    return res.status(400).json(response);
  }
  try {
    const outputGameState = await executeTurn(id, inputGameState);
    if (!outputGameState) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Game not found",
      };
      return res.status(404).json(response);
    }
    const response: ApiResponse<GameResponseData> = {
      success: true,
      game: { _id: id, state: outputGameState },
    };
    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error processing game turn:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Internal server error",
    };
    return res.status(500).json(response);
  }
};
