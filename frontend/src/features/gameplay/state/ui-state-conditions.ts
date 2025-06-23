// features/gameplay/state/condition-evaluator.ts
import { GAME_TYPE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";

/**
 * Condition evaluation functions for state machine transitions
 */
export const conditions: Record<
  string,
  (gameData: GameData, activeTurn: TurnData | null) => boolean
> = {
  // Turn state conditions
  codebreakerTurnEnded: (gameData, activeTurn) => {
    return activeTurn?.status === "COMPLETED" ||
      (activeTurn?.hasGuesses && activeTurn?.guessesRemaining === 0)
      ? true
      : false;
  },

  myTeamsTurn: (gameData, activeTurn) => {
    return activeTurn?.teamName === gameData.playerContext?.teamName;
  },

  turnInProgress: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE";
  },

  waitingForClue: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE" && !activeTurn?.clue;
  },

  waitingForGuess: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE" &&
      activeTurn?.clue &&
      !activeTurn?.hasGuesses
      ? true
      : false;
  },

  // Game state conditions
  gameEnded: (gameData) => gameData.status === "COMPLETED",

  roundCompleted: (gameData) => gameData.currentRound?.status === "COMPLETED",

  singleDeviceMode: (gameData) => gameData.gameType === GAME_TYPE.SINGLE_DEVICE,

  // Negated conditions
  "!gameEnded": (gameData) => gameData.status !== "COMPLETED",

  "!roundCompleted": (gameData) =>
    gameData.currentRound?.status !== "COMPLETED",

  "!singleDeviceMode": (gameData) =>
    gameData.gameType !== GAME_TYPE.SINGLE_DEVICE,
};

/**
 * Evaluates a condition key against game data and active turn
 */
export const evaluateConditions = (
  conditionKey: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): boolean => {
  const conditionFunc = conditions[conditionKey];

  if (!conditionFunc) {
    console.warn(`[CONDITION_EVALUATOR] Unknown condition: ${conditionKey}`);
    return false;
  }

  const result = conditionFunc(gameData, activeTurn);
  console.log(`[CONDITION_EVALUATOR] "${conditionKey}": ${result}`);
  return result;
};
