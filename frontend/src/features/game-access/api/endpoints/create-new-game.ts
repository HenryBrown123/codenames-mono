import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GameType, GameFormat } from "@codenames/shared/types";

export interface CreateGamePayload {
  gameType: GameType;
  gameFormat: GameFormat;
}

interface CreateGameApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      gameType: GameType;
      gameFormat: GameFormat;
      createdAt: string;
    };
  };
}

export const createNewGame = async (
  payload: CreateGamePayload,
): Promise<CreateGameApiResponse["data"]["game"]> => {
  const response: AxiosResponse<CreateGameApiResponse> = await api.post(
    "/games",
    payload,
  );

  if (!response.data.success) {
    throw new Error("Failed to create a new game");
  }

  return response.data.data.game;
};
