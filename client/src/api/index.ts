import axios, { AxiosResponse } from "axios";
import { Settings, GameState, GameData } from "@game/game-common-types"; // Adjust the path accordingly

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

type NewGameResponse = {
  success: boolean;
  newgame: GameData;
};

// Updated API calls to better align with React Query hooks
const createNewGame = async (payload?: Settings): Promise<GameData> => {
  const response: AxiosResponse<NewGameResponse> = await api.post(
    "/games",
    payload
  );
  if (!response.data.success) {
    console.error("Failed to create a new game", response.data);
  }
  return response.data.newgame;
};

type FetchGameResponse = {
  success: boolean;
  game: GameData;
};

const fetchGame = async (gameId: string): Promise<GameData> => {
  const response: AxiosResponse<FetchGameResponse> = await api.get(
    `/games/${gameId}`
  );
  console.log(response);
  return response.data.game;
};

type SubmitTurnResponse = {
  success: boolean;
  game: GameState;
};

const submitTurn = async (
  id: string,
  gameState: GameState
): Promise<GameState> => {
  const response: AxiosResponse<SubmitTurnResponse> = await api.post(
    `/games/${id}/turn`,
    gameState
  );
  return response.data.game;
};

const apis = {
  createNewGame,
  fetchGame,
  submitTurn,
};

export default apis;
