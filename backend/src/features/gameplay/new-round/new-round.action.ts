import { createNewRound } from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";

/**
 * Creates a function that accepts only a validated game state for round creation
 */
export const createNextRound = (
  createRoundRepo: ReturnType<typeof createNewRound>,
) => {
  const createNewRound = async ({ id, rounds }: NewRoundValidGameState) => {
    const nextRoundNumber = (rounds?.length || 0) + 1;

    return await createRoundRepo(id, nextRoundNumber);
  };

  return createNewRound;
};
