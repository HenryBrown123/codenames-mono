// initially create records in games, rounds, turns?, cards?

// 1 transaction for ALL?

// recreate cards service

// DI - make the repo a dependency of the service, each service function should depend on a certain type of repo function

import { GetGameDataByPublicId } from "./load-game.repository";

export const createGameService =
  (getGameDataByPublicId: GetGameDataByPublicId) =>
  async (publicId: string) => {
    return await getGameDataByPublicId(publicId);
  };
