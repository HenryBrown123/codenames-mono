import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import { PlayerRole } from "@codenames/shared/types";

import { validate as checkRoundCreationRules } from "./new-round.rules";
import { CommonActions } from "../actions/gameplay-actions";

export type RoundCreationInput = {
  gameId: string;
  userId: number;
};

export type RoundCreationSuccess = {
  _roundId: number;
  roundNumber: number;
  _gameId: number;
  createdAt: Date;
};

export const ROUND_CREATION_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
} as const;

export type RoundCreationFailure =
  | {
      status: typeof ROUND_CREATION_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof ROUND_CREATION_ERROR.GAME_NOT_FOUND;
      gameId: string;
    };

export type RoundCreationResult =
  | { success: true; data: RoundCreationSuccess }
  | { success: false; error: RoundCreationFailure };

export type RoundCreationDependencies = {
  getGameState: GameplayStateProvider;
  createActionsForRole: (role: PlayerRole) => { execute: any };
};

export const roundCreationService = (
  dependencies: RoundCreationDependencies,
) => {
  return async (input: RoundCreationInput): Promise<RoundCreationResult> => {
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

    if (!gameData) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    const validationResult = checkRoundCreationRules(gameData);
    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    const { execute } = dependencies.createActionsForRole(
      gameData.playerContext.role,
    );

    const result = await execute(async (actions: CommonActions) => {
      const newRound = await actions.createNextRound(validationResult.data);

      return {
        _roundId: newRound._id,
        roundNumber: newRound.roundNumber,
        _gameId: newRound._gameId,
        createdAt: newRound.createdAt,
      };
    });

    return {
      success: true,
      data: result,
    };
  };
};

export type RoundCreationService = ReturnType<typeof roundCreationService>;
