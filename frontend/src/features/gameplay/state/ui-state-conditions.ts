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
  // The SERVER is the source of truth for role transitions
  codebreakerTurnEnded: (gameData, activeTurn) => {
    // If the server says you're no longer a codebreaker, then the turn ended
    const serverSaysNotCodebreaker =
      gameData.playerContext?.role !== "CODEBREAKER";
    console.log(
      "[CONDITION] codebreakerTurnEnded - server role:",
      gameData.playerContext?.role,
      "result:",
      serverSaysNotCodebreaker,
    );
    return serverSaysNotCodebreaker;
  },

  // Game state conditions - these are straightforward
  gameEnded: (gameData) => {
    const ended = gameData.status === "COMPLETED";
    console.log("[CONDITION] gameEnded:", ended);
    return ended;
  },

  roundCompleted: (gameData) => {
    const completed = gameData.currentRound?.status === "COMPLETED";
    console.log("[CONDITION] roundCompleted:", completed);
    return completed;
  },

  singleDeviceMode: (gameData) => {
    const isSingle = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;
    console.log("[CONDITION] singleDeviceMode:", isSingle);
    return isSingle;
  },

  // Negated conditions
  "!gameEnded": (gameData) => {
    const notEnded = gameData.status !== "COMPLETED";
    console.log("[CONDITION] !gameEnded:", notEnded);
    return notEnded;
  },

  "!roundCompleted": (gameData) => {
    const notCompleted = gameData.currentRound?.status !== "COMPLETED";
    console.log("[CONDITION] !roundCompleted:", notCompleted);
    return notCompleted;
  },

  "!singleDeviceMode": (gameData) => {
    const notSingle = gameData.gameType !== GAME_TYPE.SINGLE_DEVICE;
    console.log("[CONDITION] !singleDeviceMode:", notSingle);
    return notSingle;
  },
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
