import { AxiosResponse } from "axios";
import api from "@lib/api";
import { GameData } from "@shared-types/game-types";

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

export default fetchGame;
