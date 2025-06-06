import {
  ClueCreator,
  TurnGuessUpdater,
} from "@backend/common/data-access/repositories/turns.repository";
import { GiveClueValidGameState } from "./give-clue.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import { UnexpectedGameplayError } from "../errors/gameplay.errors";

/**
 * Factory function that creates a clue giving action with repository dependencies
 */
export const giveClueToTurn = (
  createClue: ClueCreator,
  updateTurnGuesses: TurnGuessUpdater,
) => {
  /**
   * Gives a clue for the current turn in a pre-validated game state
   * Handles both clue creation AND setting appropriate guess allowance
   */
  return async (
    gameState: GiveClueValidGameState,
    word: string,
    targetCardCount: number,
  ) => {
    const currentTurn = complexProperties.getCurrentTurn(gameState);
    if (!currentTurn) {
      throw new UnexpectedGameplayError("No active turn found");
    }

    // Create the clue
    const clue = await createClue(currentTurn._id, { word, targetCardCount });

    // Domain rule: In Codenames, players get target count + 1 guesses
    const allowedGuesses = targetCardCount + 1;

    // Validate against remaining cards (business rule enforcement in action)
    const unselectedCards = gameState.currentRound.cards.filter(
      (card) => !card.selected,
    );
    if (allowedGuesses > unselectedCards.length) {
      throw new UnexpectedGameplayError(
        `Cannot allow ${allowedGuesses} guesses when only ${unselectedCards.length} cards remain`,
      );
    }

    // Update guess allowance as part of the domain action
    const updatedTurn = await updateTurnGuesses(
      currentTurn._id,
      allowedGuesses,
    );

    return {
      clue,
      turn: updatedTurn,
    };
  };
};

export type ClueGiver = ReturnType<typeof giveClueToTurn>;
