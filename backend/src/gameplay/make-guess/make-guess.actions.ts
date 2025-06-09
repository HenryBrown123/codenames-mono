import { ROUND_STATE } from "@codenames/shared/types";
import type {
  MakeGuessValidGameState,
  EndTurnValidGameState,
  StartTurnValidGameState,
  EndRoundValidGameState,
} from "./make-guess.rules";
import {
  CardUpdater,
  CardId,
} from "@backend/common/data-access/repositories/cards.repository";
import {
  GuessCreator,
  TurnGuessUpdater,
  TurnStatusUpdater,
  TurnCreator,
} from "@backend/common/data-access/repositories/turns.repository";
import {
  RoundStatusUpdater,
  RoundWinnerUpdater,
} from "@backend/common/data-access/repositories/rounds.repository";
import { complexProperties } from "../state/gameplay-state.helpers";
import { CODEBREAKER_OUTCOME } from "@codenames/shared/types";

/**
 * Helper for determining guess outcome based on card and team
 */
function determineOutcome(card: any, guessingTeamId: number): string {
  switch (card.cardType) {
    case "ASSASSIN":
      return CODEBREAKER_OUTCOME.ASSASSIN_CARD;
    case "BYSTANDER":
      return CODEBREAKER_OUTCOME.BYSTANDER_CARD;
    case "TEAM":
      return card._teamId === guessingTeamId
        ? CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD
        : CODEBREAKER_OUTCOME.OTHER_TEAM_CARD;
    default:
      throw new Error(`Unknown card type: ${card.cardType}`);
  }
}

/**
 * Creates the make guess action
 */
export const createMakeGuessAction = (deps: {
  updateCards: CardUpdater;
  createGuess: GuessCreator;
  updateTurnGuesses: TurnGuessUpdater;
}) => {
  return async (
    validatedGameState: MakeGuessValidGameState,
    cardId: number,
  ) => {
    const currentTurn =
      complexProperties.getCurrentTurnOrThrow(validatedGameState);

    // Update card as selected and get card data
    const [card] = await deps.updateCards([cardId], { selected: true });

    // Determine outcome based on card and team
    const outcome = determineOutcome(
      card,
      validatedGameState.playerContext._teamId,
    );

    // Calculate new guess count based on outcome
    const shouldContinue = outcome === CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD;
    const newGuessesRemaining = shouldContinue
      ? Math.max(0, currentTurn.guessesRemaining - 1)
      : 0;

    // Create guess record
    const guess = await deps.createGuess({
      turnId: currentTurn._id,
      playerId: validatedGameState.playerContext._id,
      cardId,
      outcome,
    });

    // Update turn with new guess count
    const updatedTurn = await deps.updateTurnGuesses(
      currentTurn._id,
      newGuessesRemaining,
    );

    return {
      card,
      guess,
      turn: updatedTurn,
      outcome,
      shouldContinue,
      createdAt: guess.createdAt,
    };
  };
};

/**
 * Creates the end turn action
 */
export const createEndTurnAction = (deps: {
  updateTurnStatus: TurnStatusUpdater;
}) => {
  return async (validatedGameState: EndTurnValidGameState, turnId: number) => {
    return await deps.updateTurnStatus(turnId, "COMPLETED");
  };
};

/**
 * Creates the start turn action
 */
export const createStartTurnAction = (deps: { createTurn: TurnCreator }) => {
  return async (
    validatedGameState: StartTurnValidGameState,
    roundId: number,
    teamId: number,
  ) => {
    return await deps.createTurn({
      roundId,
      teamId,
      guessesRemaining: 0,
    });
  };
};

/**
 * Creates the end round action - can be called regardless of turn status
 */
export const createEndRoundAction = (deps: {
  updateRoundStatus: RoundStatusUpdater;
  updateRoundWinner: RoundWinnerUpdater;
}) => {
  return async (
    validatedGameState: EndRoundValidGameState,
    roundId: number,
    winningTeamId: number,
  ) => {
    await deps.updateRoundStatus({
      roundId,
      status: ROUND_STATE.COMPLETED,
    });

    return await deps.updateRoundWinner({
      roundId,
      winningTeamId,
    });
  };
};

export type MakeGuessAction = ReturnType<typeof createMakeGuessAction>;
export type EndTurnAction = ReturnType<typeof createEndTurnAction>;
export type StartTurnAction = ReturnType<typeof createStartTurnAction>;
export type EndRoundAction = ReturnType<typeof createEndRoundAction>;
