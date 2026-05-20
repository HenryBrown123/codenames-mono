import { AxiosResponse } from "axios";
import api from "@frontend/shared/api/api";
import { GameType, GameFormat } from "@codenames/shared/types";

interface CreateGameInput {
  gameType: GameType;
  gameFormat: GameFormat;
}

/** Input payload accepted by {@link createNewGame}. */
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

/** Domain-shaped result of {@link createNewGame}. */
export interface GameCreatedResult {
  publicId: string;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: Date;
}

/**
 * Creates a new game with the given type/format. Coerces the
 * response's `createdAt` to a `Date` and narrows the game-type /
 * game-format strings back to their shared-type unions.
 */
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
