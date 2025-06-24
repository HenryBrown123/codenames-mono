import { AxiosResponse } from "axios";
import api from "@frontend/lib/api";
import { GameType, GameFormat } from "@codenames/shared/types";

interface CreateGameInput {
  gameType: GameType;
  gameFormat: GameFormat;
}

export interface CreateGamePayload extends CreateGameInput {}

interface CreateGameApiResponse {
  success: boolean;
  data: {
    game: {
      publicId: string;
      gameType: string;
      gameFormat: string;
      createdAt: string;
    };
  };
}

export interface GameCreatedResult {
  publicId: string;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: Date;
}

export const createNewGame = async (
  payload: CreateGamePayload,
): Promise<GameCreatedResult> => {
  const response: AxiosResponse<CreateGameApiResponse> = await api.post(
    "/games",
    payload,
  );

  if (!response.data.success) {
    throw new Error("Failed to create a new game");
  }

  const game = response.data.data.game;
  return {
    publicId: game.publicId,
    gameType: game.gameType as GameType,
    gameFormat: game.gameFormat as GameFormat,
    createdAt: new Date(game.createdAt),
  };
};
