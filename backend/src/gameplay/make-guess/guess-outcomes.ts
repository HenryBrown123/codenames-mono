import { CODEBREAKER_OUTCOME } from "@codenames/shared/types";
import type { MakeGuessValidGameState } from "./make-guess.rules";
import type { GameplayOperations } from "../gameplay-actions";
import {
  validateEndTurn,
  validateStartTurn,
  validateEndRound,
} from "./make-guess.rules";

type GuessOutcomeResult = {
  type: "TURN_END" | "ROUND_END";
  nextTeam?: string;
  winner?: string;
  reason: string;
};

type OutcomeHandlerDeps = {
  gameState: MakeGuessValidGameState;
  currentTurn: any;
  ops: GameplayOperations;
};

/**
 * Handles correct guess continuation - no state transitions needed
 */
async function handleCorrectGuessContinue({
  gameState,
  currentTurn,
  ops,
}: OutcomeHandlerDeps): Promise<null> {
  return null;
}

/**
 * Handles assassin card hit - validates then ends turn, re-validates, then ends round
 */
async function handleAssassinCardHit({
  gameState,
  currentTurn,
  ops,
}: OutcomeHandlerDeps): Promise<GuessOutcomeResult> {
  const endTurnValidation = validateEndTurn(gameState);

  if (!endTurnValidation.valid) {
    throw new Error(
      `Cannot end turn for assassin hit: ${endTurnValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }

  const otherTeam = gameState.teams.find(
    (team) => team._id !== currentTurn._teamId,
  );
  if (!otherTeam) throw new Error("No other team found");

  await ops.endTurn(endTurnValidation.data, currentTurn._id);

  const updatedGameState = await ops.getCurrentGameState(
    gameState.public_id,
    gameState.playerContext._userId,
  );

  const endRoundValidation = validateEndRound(updatedGameState);

  if (!endRoundValidation.valid) {
    throw new Error(
      `Cannot end round after assassin hit: ${endRoundValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }
  await ops.endRound(
    endRoundValidation.data,
    gameState.currentRound._id,
    otherTeam._id,
  );

  return {
    type: "ROUND_END",
    winner: otherTeam.teamName,
    reason: "assassin-hit",
  };
}

/**
 * Handles team victory by finding all cards - validates then ends turn, re-validates, then ends round
 */
async function handleTeamVictoryByCompletion({
  gameState,
  currentTurn,
  ops,
}: OutcomeHandlerDeps): Promise<GuessOutcomeResult> {
  const endTurnValidation = validateEndTurn(gameState);

  if (!endTurnValidation.valid) {
    throw new Error(
      `Cannot end turn for team victory: ${endTurnValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }

  const winningTeam = gameState.teams.find(
    (team) => team._id === currentTurn._teamId,
  );
  if (!winningTeam) throw new Error("Winning team not found");

  await ops.endTurn(endTurnValidation.data, currentTurn._id);

  const updatedGameState = await ops.getCurrentGameState(
    gameState.public_id,
    gameState.playerContext._userId,
  );

  const endRoundValidation = validateEndRound(updatedGameState);

  if (!endRoundValidation.valid) {
    throw new Error(
      `Cannot end round after team victory: ${endRoundValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }

  await ops.endRound(
    endRoundValidation.data,
    gameState.currentRound._id,
    currentTurn._teamId,
  );

  return {
    type: "ROUND_END",
    winner: winningTeam.teamName,
    reason: "all-cards-found",
  };
}

/**
 * Handles normal turn end - validates then ends current turn, re-validates, then starts next turn
 */
async function handleTurnEndTransition({
  gameState,
  currentTurn,
  ops,
}: OutcomeHandlerDeps): Promise<GuessOutcomeResult> {
  const endTurnValidation = validateEndTurn(gameState);

  if (!endTurnValidation.valid) {
    throw new Error(
      `Cannot end turn: ${endTurnValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }

  const nextTeam = gameState.teams.find(
    (team) => team._id !== currentTurn._teamId,
  );
  if (!nextTeam) throw new Error("Next team not found");

  await ops.endTurn(endTurnValidation.data, currentTurn._id);

  const updatedGameState = await ops.getCurrentGameState(
    gameState.public_id,
    gameState.playerContext._userId,
  );

  const startTurnValidation = validateStartTurn(updatedGameState);

  if (!startTurnValidation.valid) {
    throw new Error(
      `Cannot start new turn: ${startTurnValidation.errors.map((e) => e.message).join(", ")}`,
    );
  }

  await ops.startTurn(
    startTurnValidation.data,
    gameState.currentRound._id,
    nextTeam._id,
  );

  return {
    type: "TURN_END",
    nextTeam: nextTeam.teamName,
    reason: "normal-transition",
  };
}

/**
 * Business logic helper
 */
const gameLogic = {
  hasTeamWon(gameState: MakeGuessValidGameState, teamId: number): boolean {
    return gameState.currentRound.cards.every(
      (card: any) =>
        card.cardType !== "TEAM" || card._teamId !== teamId || card.selected,
    );
  },
};

/**
 * Selects the appropriate outcome handler based on guess result
 */
export function getGuessOutcomeHandler(
  outcome: string,
  shouldContinue: boolean,
  gameState: MakeGuessValidGameState,
) {
  // Turn continues with more guesses
  if (shouldContinue) {
    return handleCorrectGuessContinue;
  }

  // Assassin hit - immediate round end
  if (outcome === CODEBREAKER_OUTCOME.ASSASSIN_CARD) {
    return handleAssassinCardHit;
  }

  // Check if team won by finding all their cards
  if (
    outcome === CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD &&
    gameLogic.hasTeamWon(gameState, gameState.playerContext._teamId)
  ) {
    return handleTeamVictoryByCompletion;
  }

  // Normal turn end (wrong guess, bystander, or no more guesses)
  return handleTurnEndTransition;
}
