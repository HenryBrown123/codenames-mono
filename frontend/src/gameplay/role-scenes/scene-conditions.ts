import { GAME_TYPE } from "@codenames/shared/types";
import { GameData, TurnData } from "@frontend/shared-types";
import { act } from "react";

/**
 * Condition evaluation functions for state machine transitions
 */
export const conditions: Record<
  string,
  (gameData: GameData, activeTurn: TurnData | null) => boolean
> = {
  codebreakerTurnEnded: (gameData, activeTurn) => {
    console.log(
      "[CONDITION] codebreakerTurnEnded - turnCompleted:",
      gameData,
      activeTurn,
    );
    // Turn ended if turn is completed OR if server says you're no longer codebreaker
    const turnCompleted = activeTurn?.status === "COMPLETED";
    const serverSaysNotCodebreaker =
      gameData.playerContext?.role !== "CODEBREAKER";

    const result = turnCompleted || serverSaysNotCodebreaker;
    console.log(
      "[CONDITION] codebreakerTurnEnded - turnCompleted:",
      turnCompleted,
      "serverRole:",
      gameData.playerContext?.role,
      "result:",
      result,
    );
    return result;
  },
  // Game state conditions - these are straightforward
  gameEnded: (gameData) => {
    const ended = gameData.status === "COMPLETED";
    //console.log("[CONDITION] gameEnded:", ended);
    return ended;
  },

  roundCompleted: (gameData) => {
    const completed = gameData.currentRound?.status === "COMPLETED";
    //console.log("[CONDITION] roundCompleted:", completed);
    return completed;
  },

  singleDeviceMode: (gameData) => {
    const isSingle = gameData.gameType === GAME_TYPE.SINGLE_DEVICE;
    //console.log("[CONDITION] singleDeviceMode:", isSingle);
    return isSingle;
  },

  // Negated conditions
  "!gameEnded": (gameData) => {
    const notEnded = gameData.status !== "COMPLETED";
    //console.log("[CONDITION] !gameEnded:", notEnded);
    return notEnded;
  },

  "!roundCompleted": (gameData) => {
    const notCompleted = gameData.currentRound?.status !== "COMPLETED";
    //console.log("[CONDITION] !roundCompleted:", notCompleted);
    return notCompleted;
  },

  "!singleDeviceMode": (gameData) => {
    const notSingle = gameData.gameType !== GAME_TYPE.SINGLE_DEVICE;
    //console.log("[CONDITION] !singleDeviceMode:", notSingle);
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
  //console.log(`[CONDITION_EVALUATOR] "${conditionKey}": ${result}`);
  return result;
};
