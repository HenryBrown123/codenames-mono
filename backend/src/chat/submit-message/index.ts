import type { GameplayStateProvider } from "@backend/game/gameplay/state/gameplay-state.provider";
import type { DbContext } from "@backend/shared/data-access/transaction-handler";

import * as gameMessagesRepository from "@backend/shared/data-access/repositories/game-messages.repository";
import { submitMessageService } from "./submit-message.service";
import { submitMessageController } from "./submit-message.controller";

/**
 * Dependencies required by the submit message feature
 */
export interface SubmitMessageDependencies {
  getGameState: GameplayStateProvider;
  db: DbContext;
}

/**
 * Initializes the submit message feature with all dependencies
 */
export const submitMessage = (dependencies: SubmitMessageDependencies) => {
  const service = submitMessageService({
    createGameMessage: gameMessagesRepository.createMessage(dependencies.db),
    getGameState: dependencies.getGameState,
  });

  const controller = submitMessageController({
    submitMessage: service,
  });

  return {
    controller,
    service,
  };
};

export default submitMessage;
