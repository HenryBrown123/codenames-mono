import axios, { AxiosResponse } from "axios";
import { Settings, GameState, GameData } from "@game/types/game-common-types"; // Adjust the path accordingly

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Include cookies with each request
});

type NewGameResponse = {
  success: boolean;
  game: GameData;
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
  return response.data.game;
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
  game: GameData;
};

const submitTurn = async (
  id: string,
  gameState: GameState
): Promise<GameState> => {
  const response: AxiosResponse<SubmitTurnResponse> = await api.post(
    `/games/${id}/turn`,
    gameState
  );
  return response.data.game.state;
};

interface CreateGuestSessionResponse extends Response {
  success: boolean;
}

// Creates a session and guest user
const createGuestSession = async (): Promise<CreateGuestSessionResponse> => {
  const response: AxiosResponse<CreateGuestSessionResponse> = await api.post(
    "/auth/guest"
  );
  if (!response.data.success) {
    console.error("Failed to create a new session", response.data);
  }
  console.log("Session created!");
  return response.data;
};

interface LogoutSessionResponse extends Response {
  success: boolean;
}

const logoutSession = async (): Promise<CreateGuestSessionResponse> => {
  const response: AxiosResponse<LogoutSessionResponse> = await api.post(
    "/auth/logout"
  );
  if (!response.data.success) {
    console.error("Failed to log out", response.data);
  }
  return response.data;
};

const apis = {
  createNewGame,
  fetchGame,
  submitTurn,
  createGuestSession,
  logoutSession,
};

export default apis;
