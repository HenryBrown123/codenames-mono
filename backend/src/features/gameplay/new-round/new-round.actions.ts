import { createNewRound } from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { gameAccessors } from "../state/gameplay-state.helpers";

/**
 * Creates a function that accepts only a validated game state for round creation
 */
export const createNextRound = (
  createRoundRepo: ReturnType<typeof createNewRound>,
) => {
  const createNewRound = async (gameState: NewRoundValidGameState) => {
    const nextRoundNumber = gameAccessors.getRoundCount(gameState) + 1;
    return await createRoundRepo(gameState.id, nextRoundNumber);
  };

  return createNewRound;
};
