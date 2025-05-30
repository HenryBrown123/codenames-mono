// backend/src/features/gameplay/start-round/start-round.service.ts
import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import { PlayerRole } from "@codenames/shared/types";

import { validate as checkRoundStartRules } from "./start-round.rules";
import { CommonActions } from "../actions/gameplay-actions";

export type StartRoundInput = {
  gameId: string;
  roundNumber: number;
  userId: number;
};

export type StartRoundSuccess = {
  roundNumber: number;
  status: string;
};

export const START_ROUND_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
  ROUND_NOT_FOUND: "round-not-found",
} as const;

export type StartRoundFailure =
  | {
      status: typeof START_ROUND_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof START_ROUND_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof START_ROUND_ERROR.ROUND_NOT_FOUND;
      roundNumber: number;
    };

export type StartRoundResult =
  | { success: true; data: StartRoundSuccess }
  | { success: false; error: StartRoundFailure };

export type StartRoundDependencies = {
  getGameState: GameplayStateProvider;
  createActionsForRole: (role: PlayerRole) => { execute: any };
};

export const startRoundService = (dependencies: StartRoundDependencies) => {
  return async (input: StartRoundInput): Promise<StartRoundResult> => {
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

    if (!gameData) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    if (!gameData.currentRound) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.ROUND_NOT_FOUND,
          roundNumber: input.roundNumber,
        },
      };
    }

    if (gameData.currentRound.number !== input.roundNumber) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.INVALID_GAME_STATE,
          currentState: JSON.stringify(gameData),
          validationErrors: [],
        },
      };
    }

    const validationResult = checkRoundStartRules(gameData);

    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: START_ROUND_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    const { execute } = dependencies.createActionsForRole(
      gameData.playerContext.role,
    );

    const updatedRound = await execute(async (actions: CommonActions) => {
      return await actions.startRound(validationResult.data);
    });

    return {
      success: true,
      data: {
        roundNumber: updatedRound.roundNumber,
        status: updatedRound.status,
      },
    };
  };
};

export type StartRoundService = ReturnType<typeof startRoundService>;
