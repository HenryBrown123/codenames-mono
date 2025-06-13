import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import {
  GameData,
  GameStateApiResponse,
  transformApiResponseToGameData,
} from "@frontend/shared-types";

/**
 * Fetches game state from the new backend API
 * GET /games/{gameId}
 */
const fetchGame = async (gameId: string): Promise<GameData> => {
  const response: AxiosResponse<GameStateApiResponse> = await api.get(
    `/games/${gameId}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch game data");
  }

  // Transform API response to UI-friendly format
  return transformApiResponseToGameData(response.data);
};

export default fetchGame;
