import { createNewRound } from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";

/**
 * Factory function that creates a round creation action with repository dependencies.
 * Only accepts pre-validated game states to ensure business rules compliance.
 */
export const createNextRound = (
  createRoundRepo: ReturnType<typeof createNewRound>,
) => {
  const createNewRound = async (gameState: NewRoundValidGameState) => {
    const nextRoundNumber = complexProperties.getRoundCount(gameState) + 1;
    return await createRoundRepo(gameState.id, nextRoundNumber);
  };

  return createNewRound;
};
