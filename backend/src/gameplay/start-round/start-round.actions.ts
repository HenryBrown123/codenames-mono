import { RoundStatusUpdater } from "@backend/common/data-access/repositories/rounds.repository";
import { StartRoundValidGameState } from "./start-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { ROUND_STATE } from "@codenames/shared/types";

/**
 * Creates a function to start a round by updating its status
 *
 * @param updateRoundStatus - Repository funcstion for updating round status
 * @returns Function that updates the round status from a validated game state
 */
export const startCurrentRound = (updateRoundStatus: RoundStatusUpdater) => {
  /**
   * Updates the round status to indicate it has started
   * Takes a pre-validated game state to ensure business rules are met
   *
   * @param gameState - Validated game state that meets all business rules
   * @returns Updated round data
   */
  const startRoundFromValidState = async (
    gameState: StartRoundValidGameState,
  ) => {
    const currentRound = complexProperties.getLatestRoundOrThrow(gameState);

    return await updateRoundStatus({
      roundId: currentRound._id,
      status: ROUND_STATE.IN_PROGRESS,
    });
  };

  return startRoundFromValidState;
};
