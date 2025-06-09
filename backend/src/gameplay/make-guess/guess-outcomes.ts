import { CODEBREAKER_OUTCOME } from "@codenames/shared/types";
import type { GameplayOperations } from "../gameplay-actions";
import { gameRules } from "./make-guess.rules";
import { complexProperties } from "../state/gameplay-state.helpers";

/**
 * Type for outcome handler dependencies
 */
type OutcomeHandlerDeps = {
  currentTurn: any;
  ops: GameplayOperations;
  gameId: string;
  userId: number;
};

/**
 * Handles correct team card hit - can continue turn or end round
 */
async function handleCorrectTeamCardHit({
  ops,
  currentTurn,
  gameId,
  userId,
}: OutcomeHandlerDeps) {
  const gameState = await ops.getCurrentGameState(gameId, userId);
  const otherTeamId = complexProperties.getOtherTeamId(
    gameState,
    currentTurn._teamId,
  );
  const roundWinner = gameRules.checkRoundWinner(
    gameState.currentRound!.cards,
    currentTurn._teamId,
    otherTeamId,
  );

  // Case 1: Round won - end turn, end round, maybe end game
  if (roundWinner) {
    await ops.endTurn(gameState, currentTurn._id);
    await ops.endRound(gameState, gameState.currentRound!._id, roundWinner);

    const gameWinner = gameRules.checkGameWinner(
      gameState.historicalRounds,
      gameState.game_format,
    );
    if (gameWinner) {
      await ops.endGame(gameState, gameWinner);
    }

    return await ops.getCurrentGameState(gameId, userId);
  }

  // Case 2: No more guesses - end turn, start next turn
  if (currentTurn.guessesRemaining === 0) {
    await ops.endTurn(gameState, currentTurn._id);
    await ops.startTurn(gameState, gameState.currentRound!._id, otherTeamId);
  }

  // Case 3: Turn continues, refresh game state
  return await ops.getCurrentGameState(gameId, userId);
}

/**
 * Handles wrong team card hit - always ends turn
 */
async function handleWrongTeamCardHit({
  ops,
  currentTurn,
  gameId,
  userId,
}: OutcomeHandlerDeps) {
  const gameState = await ops.getCurrentGameState(gameId, userId);
  await ops.endTurn(gameState, currentTurn._id);

  const otherTeamId = complexProperties.getOtherTeamId(
    gameState,
    currentTurn._teamId,
  );
  const roundWinner = gameRules.checkRoundWinner(
    gameState.currentRound!.cards,
    currentTurn._teamId,
    otherTeamId,
  );

  if (roundWinner) {
    await ops.endRound(gameState, gameState.currentRound!._id, roundWinner);

    const gameWinner = gameRules.checkGameWinner(
      gameState.historicalRounds,
      gameState.game_format,
    );
    if (gameWinner) {
      await ops.endGame(gameState, gameWinner);
    }
  } else {
    await ops.startTurn(gameState, gameState.currentRound!._id, otherTeamId);
  }

  return await ops.getCurrentGameState(gameId, userId);
}

/**
 * Handles bystander card hit - always ends turn, never ends round
 */
async function handleBystanderCardHit({
  ops,
  currentTurn,
  gameId,
  userId,
}: OutcomeHandlerDeps) {
  const gameState = await ops.getCurrentGameState(gameId, userId);
  await ops.endTurn(gameState, currentTurn._id);

  const otherTeamId = complexProperties.getOtherTeamId(
    gameState,
    currentTurn._teamId,
  );
  await ops.startTurn(gameState, gameState.currentRound!._id, otherTeamId);

  return await ops.getCurrentGameState(gameId, userId);
}

/**
 * Handles assassin card hit - immediately ends round for other team
 */
async function handleAssassinCardHit({
  ops,
  currentTurn,
  gameId,
  userId,
}: OutcomeHandlerDeps) {
  const gameState = await ops.getCurrentGameState(gameId, userId);
  await ops.endTurn(gameState, currentTurn._id);

  const otherTeamId = complexProperties.getOtherTeamId(
    gameState,
    currentTurn._teamId,
  );
  await ops.endRound(gameState, gameState.currentRound!._id, otherTeamId);

  const gameWinner = gameRules.checkGameWinner(
    gameState.historicalRounds,
    gameState.game_format,
  );
  if (gameWinner) {
    await ops.endGame(gameState, gameWinner);
  }

  return await ops.getCurrentGameState(gameId, userId);
}

/**
 * Selects the appropriate outcome handler based on guess result
 */
export function getGuessOutcomeHandler(outcome: string) {
  switch (outcome) {
    case CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD:
      return handleCorrectTeamCardHit;
    case CODEBREAKER_OUTCOME.OTHER_TEAM_CARD:
      return handleWrongTeamCardHit;
    case CODEBREAKER_OUTCOME.BYSTANDER_CARD:
      return handleBystanderCardHit;
    case CODEBREAKER_OUTCOME.ASSASSIN_CARD:
      return handleAssassinCardHit;
    default:
      throw new Error(`Unknown outcome: ${outcome}`);
  }
}
