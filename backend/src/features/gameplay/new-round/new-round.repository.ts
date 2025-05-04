// src/features/gameplay/repository/rounds-gameplay-repository.ts

import {
  createNewRound,
  RoundResult,
} from "@backend/common/data-access/rounds.repository";
import { NewRoundValidGameState } from "../new-round/new-round.rules";

/**
 * Creates a function that accepts only a validated game state for round creation
 */
export const createRoundFromGameplay = (
  createRoundRepo: ReturnType<typeof createNewRound>,
) => {
  return ({ id, rounds }: NewRoundValidGameState): Promise<RoundResult> => {
    // Calculate the next round number from the rounds array
    const nextRoundNumber = (rounds?.length || 0) + 1;

    // Use the id from the validated state
    return createRoundRepo(id, nextRoundNumber);
  };
};
