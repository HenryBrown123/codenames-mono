import { RoundStatusUpdater } from "@backend/common/data-access/repositories/rounds.repository";
import { TurnCreator } from "@backend/common/data-access/repositories/turns.repository";
import { StartRoundValidGameState } from "./start-round.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { ROUND_STATE } from "@codenames/shared/types";

/**
 * Creates a function to start a round by updating its status and creating the first turn
 *
 * @param updateRoundStatus - Repository function for updating round status
 * @param createTurn - Repository function for creating turns
 * @returns Function that updates the round status and creates first turn from a validated game state
 */
export const startCurrentRound = (
  updateRoundStatus: RoundStatusUpdater,
  createTurn: TurnCreator,
) => {
  /**
   * Updates the round status to indicate it has started and creates the first turn
   * Takes a pre-validated game state to ensure business rules are met
   *
   * @param gameState - Validated game state that meets all business rules
   * @returns Updated round data
   */
  const startRoundFromValidState = async (
    gameState: StartRoundValidGameState,
  ) => {
    const currentRound = complexProperties.getLatestRoundOrThrow(gameState);

    // Update round status to IN_PROGRESS
    const updatedRound = await updateRoundStatus({
      roundId: currentRound._id,
      status: ROUND_STATE.IN_PROGRESS,
    });

    // Determine starting team (simple logic: first team goes first)
    // You could make this more sophisticated later (e.g., random, alternating, etc.)
    const startingTeamId = gameState.teams[0]._id;

    // Create the first turn
    await createTurn({
      roundId: currentRound._id,
      teamId: startingTeamId,
      guessesRemaining: 0,
    });

    return updatedRound;
  };

  return startRoundFromValidState;
};
