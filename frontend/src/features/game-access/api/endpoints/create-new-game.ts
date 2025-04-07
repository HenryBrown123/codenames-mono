import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import {
  Settings,
  GameData,
  GameType,
} from "@codenames/shared/src/types/game-types";

export type CreateGamePayload = {
  gameType: GameType;
  settings: Settings;
};

type NewGameResponse = {
  success: boolean;
  game: GameData;
};

export const createNewGame = async (
  payload: CreateGamePayload,
): Promise<GameData> => {
  const response: AxiosResponse<NewGameResponse> = await api.post(
    "/games",
    payload,
  );

  if (!response.data.success) {
    console.error("Failed to create a new game", response.data);
    throw new Error("Failed to create a new game");
  }

  return response.data.game;
};
