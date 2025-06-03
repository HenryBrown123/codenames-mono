import { RoundCreator } from "@backend/common/data-access/repositories/rounds.repository";
import { NewRoundValidGameState } from "./new-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";

/**
 * Factory function that creates a round creation action with repository dependencies
 *
 * @param createRoundRepo - Repository function for creating new rounds
 * @returns Function that creates a new round for a validated game state
 */
export const createNextRound = (createRoundRepo: RoundCreator) => {
  /**
   * Creates a new round for a pre-validated game state
   *
   * @param gameState - Validated game state that meets all business rules
   * @returns Newly created round data
   */
  const createNewRound = async (gameState: NewRoundValidGameState) => {
    const nextRoundNumber = complexProperties.getRoundCount(gameState) + 1;
    return await createRoundRepo({
      gameId: gameState._id,
      roundNumber: nextRoundNumber,
    });
  };

  return createNewRound;
};
