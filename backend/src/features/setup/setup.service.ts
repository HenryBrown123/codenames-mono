import { CreateGameRepository } from "./setup.repository";

export const createGameService =
  (createGameRepository: CreateGameRepository) => async (publicId: string) => {
    return createGameRepository(publicId);
  };
