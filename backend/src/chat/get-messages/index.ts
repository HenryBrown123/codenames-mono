import type { GameplayStateProvider } from "@backend/game/gameplay/state/gameplay-state.provider";
import type { DbContext } from "@backend/shared/data-access/transaction-handler";

import * as gameMessagesRepository from "@backend/shared/data-access/repositories/game-messages.repository";
import { getMessagesService } from "./get-messages.service";
import { getMessagesController } from "./get-messages.controller";

/**
 * Dependencies required by the get messages feature
 */
export interface GetMessagesDependencies {
  getGameState: GameplayStateProvider;
  db: DbContext;
}

/**
 * Initializes the get messages feature with all dependencies
 */
export const getMessages = (dependencies: GetMessagesDependencies) => {
  const service = getMessagesService({
    findMessagesByGame: gameMessagesRepository.findMessagesByGame(dependencies.db),
    getGameState: dependencies.getGameState,
  });

  const controller = getMessagesController({
    getMessages: service,
  });

  return {
    controller,
    service,
  };
};

export default getMessages;
