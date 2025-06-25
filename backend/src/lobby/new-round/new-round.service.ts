import type { LobbyStateProvider } from "../state/lobby-state.provider";
import type { LobbyValidationError } from "../state/lobby-state.validation";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";

import { validate as checkRoundCreationRules } from "./new-round.rules";
import { validate as checkRoleAssignmentRules } from "../assign-roles/assign-roles.rules";

/**
 * Input parameters for round creation
 */
export type RoundCreationInput = {
  gameId: string;
  userId: number;
};

/**
 * Successful round creation result
 */
export type RoundCreationSuccess = {
  _id: number;
  roundNumber: number;
  _gameId: number;
  createdAt: Date;
};

/**
 * Round creation error types
 */
export const ROUND_CREATION_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
  USER_NOT_PLAYER: "user-not-player",
} as const;

/**
 * Round creation failure details
 */
export type RoundCreationFailure =
  | {
      status: typeof ROUND_CREATION_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: LobbyValidationError[];
    }
  | {
      status: typeof ROUND_CREATION_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof ROUND_CREATION_ERROR.USER_NOT_PLAYER;
      gameId: string;
      userId: number;
    };

/**
 * Combined result type for round creation
 */
export type RoundCreationResult =
  | { success: true; data: RoundCreationSuccess }
  | { success: false; error: RoundCreationFailure };

/**
 * Dependencies required by the round creation service
 */
export type RoundCreationDependencies = {
  getLobbyState: LobbyStateProvider;
  lobbyHandler: TransactionalHandler<LobbyOperations>;
};

/**
 * Creates a service for handling round creation with business rule validation
 *
 * @param dependencies - Required external dependencies
 * @returns Service function for creating rounds
 */
export const roundCreationService = (
  dependencies: RoundCreationDependencies,
) => {
  return async (input: RoundCreationInput): Promise<RoundCreationResult> => {
    const lobbyState = await dependencies.getLobbyState(input.gameId, input.userId);

    if (!lobbyState) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Check if user can modify game (basic permission check)
    if (!lobbyState.userContext.canModifyGame) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.USER_NOT_PLAYER,
          gameId: input.gameId,
          userId: input.userId,
        },
      };
    }

    const gameData = lobbyState;

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

    const operationResult = await dependencies.lobbyHandler(async (ops) => {
      const newRound = await ops.createRound(validationResult.data);

      // Get fresh lobby state after round creation to validate role assignment
      const stateAfterRoundCreation = await ops.getLobbyState(
        input.gameId,
        input.userId,
      );
      
      if (stateAfterRoundCreation) {
        const validatedForRoles = checkRoleAssignmentRules(
          stateAfterRoundCreation,
        );

        if (validatedForRoles.valid) {
          await ops.assignPlayerRoles(validatedForRoles.data);
        }
      }

      return {
        _id: newRound._id,
        roundNumber: newRound.roundNumber,
        _gameId: newRound._gameId,
        createdAt: newRound.createdAt,
      };
    });

    return {
      success: true,
      data: operationResult,
    };
  };
};

export type RoundCreationService = ReturnType<typeof roundCreationService>;
