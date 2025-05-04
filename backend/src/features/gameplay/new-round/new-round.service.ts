import { roundCreationAllowedSchema } from "./new-round.rules";
import { GameState } from "@codenames/shared/types";
import { GameplayValidationError } from "../state/validate-gameplay-state";
import { gameplayStateProvider } from "../state/gameplay-state.provider";
import { validateGameplayState } from "../state/validate-gameplay-state";
import { createNewRound } from "@backend/common/data-access/rounds.repository";

// ----- GENERIC SERVICE TYPES -----

/**
 * Generic service factory type
 * TDependencies: Dependencies required by the service
 * TService: The type of service function being created
 */
export type ServiceFactory<TDependencies, TService> = (
  dependencies: TDependencies,
) => TService;

// ----- PUBLIC TYPES -----

/**
 * Input type for round creation
 */
export type RoundCreationInput = {
  gameId: string;
  userId: number;
};

/**
 * Result types for round creation with discriminated union
 */
export type RoundCreationResult =
  | { success: true; data: RoundCreationSuccess }
  | { success: false; error: RoundCreationFailure };

/**
 * Service function signature
 */
export type RoundCreationService = (
  input: RoundCreationInput,
) => Promise<RoundCreationResult>;

/**
 * Success case data structure
 */
export type RoundCreationSuccess = {
  roundId: number;
  roundNumber: number;
  gameId: number;
  createdAt: Date;
};

/**
 * Error codes for round creation
 */
export const ROUND_CREATION_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
} as const;

/**
 * Failure cases for round creation
 */
export type RoundCreationFailure =
  | {
      status: typeof ROUND_CREATION_ERROR.INVALID_GAME_STATE;
      currentState: GameState;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof ROUND_CREATION_ERROR.GAME_NOT_FOUND;
      gameId: string;
    };

// ----- DEPENDENCIES TYPE -----

/**
 * Dependencies for the round creation service
 */
export type RoundCreationDependencies = {
  getGameState: ReturnType<typeof gameplayStateProvider>;
  createNewRound: ReturnType<typeof createNewRound>;
  validateGameplayState: typeof validateGameplayState;
};

// ----- SERVICE IMPLEMENTATION -----

/**
 * Creates a service for round creation
 */
export const roundCreationService: ServiceFactory<
  RoundCreationDependencies,
  RoundCreationService
> = (dependencies) => {
  /**
   * Creates a new round for a game if validation passes
   */
  return async (input: RoundCreationInput): Promise<RoundCreationResult> => {
    // Fetch game with rounds
    const gameData = await dependencies.getGameState(input.gameId);

    if (!gameData) {
      return {
        success: false,
        error: {
          status: ROUND_CREATION_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    // Validate game state using the existing validation schema
    const validationResult = dependencies.validateGameplayState(
      roundCreationAllowedSchema,
      gameData,
    );

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

    // Game validation passed, create the new round
    const validGame = validationResult.data;
    const newRoundNumber = (validGame.rounds?.length || 0) + 1;

    const newRound = await dependencies.createNewRound(
      validGame.id,
      newRoundNumber,
    );

    // Return success result
    return {
      success: true,
      data: {
        roundId: newRound.id,
        roundNumber: newRound.roundNumber,
        gameId: validGame.id,
        createdAt: newRound.createdAt,
      },
    };
  };
};
