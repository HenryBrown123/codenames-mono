import axios, { AxiosResponse } from "axios";
import { Settings, GameState, GameData } from "@game/game-common-types"; // Adjust the path accordingly

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const getNewGame = (
  payload?: Settings
): Promise<AxiosResponse<GameData>> => api.post("/games", payload);

export const getGame = (id: string): Promise<AxiosResponse<GameData>> =>
  api.get(`/games/${id}`);

export const processTurn = (
  id: string,
  gameState: GameState
): Promise<AxiosResponse<GameData>> => api.post(`/games/${id}/turn`, gameState);

const apis = {
  getNewGame,
  getGame,
  processTurn,
};

export default apis;
