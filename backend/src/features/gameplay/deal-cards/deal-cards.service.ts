import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import type { CardResult } from "@backend/common/data-access/cards.repository";
import type {
  TeamsFinder,
  GameId,
} from "@backend/common/data-access/teams.repository";

import { validate as checkCardDealingRules } from "./deal-cards.rules";
import { dealCardsToRound } from "./deal-cards.actions";

/**
 * Basic input required to deal cards
 */
export type DealCardsInput = {
  gameId: string;
  userId: number;
};

/**
 * Represents the successful dealing of cards
 */
export type DealCardsSuccess = {
  roundId: number;
  roundNumber: number;
  startingTeamId: number;
  totalCards: number;
  cards: CardResult[];
};

/**
 * Enumeration of possible errors that can occur during card dealing
 */
export const DEAL_CARDS_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
  TEAMS_NOT_FOUND: "teams-not-found",
} as const;

/**
 * Represents various failure scenarios when dealing cards
 */
export type DealCardsFailure =
  | {
      status: typeof DEAL_CARDS_ERROR.INVALID_GAME_STATE;
      currentState: string;
      validationErrors: GameplayValidationError[];
    }
  | {
      status: typeof DEAL_CARDS_ERROR.GAME_NOT_FOUND;
      gameId: string;
    }
  | {
      status: typeof DEAL_CARDS_ERROR.TEAMS_NOT_FOUND;
      gameId: string;
    };

/**
 * The complete result of attempting to deal cards
 */
export type DealCardsResult =
  | { success: true; data: DealCardsSuccess }
  | { success: false; error: DealCardsFailure };

/**
 * External dependencies required by the card dealing service
 */
export type DealCardsDependencies = {
  getGameState: GameplayStateProvider;
  getTeamsByGameId: TeamsFinder<GameId>;
  dealCardsFromValidState: ReturnType<typeof dealCardsToRound>;
};

/**
 * Creates a service for managing card dealing in a game
 */
export const dealCardsService = (dependencies: DealCardsDependencies) => {
  /**
   * Attempts to deal cards for a game round
   *
   * @throws Never - Errors are returned in the result object
   */
  return async (input: DealCardsInput): Promise<DealCardsResult> => {
    const gameData = await dependencies.getGameState(input.gameId);

    if (!gameData) {
      return {
        success: false,
        error: {
          status: DEAL_CARDS_ERROR.GAME_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    const validationResult = checkCardDealingRules(gameData);

    if (!validationResult.valid) {
      return {
        success: false,
        error: {
          status: DEAL_CARDS_ERROR.INVALID_GAME_STATE,
          currentState: gameData.status,
          validationErrors: validationResult.errors,
        },
      };
    }

    // Get teams for the game
    const teams = await dependencies.getTeamsByGameId(gameData.id);

    if (!teams || teams.length === 0) {
      return {
        success: false,
        error: {
          status: DEAL_CARDS_ERROR.TEAMS_NOT_FOUND,
          gameId: input.gameId,
        },
      };
    }

    const dealtCards = await dependencies.dealCardsFromValidState(
      validationResult.data,
      teams,
    );

    return {
      success: true,
      data: dealtCards,
    };
  };
};

/**
 * Type representing an initialized card dealing service
 * Use this when you need to pass the service as a dependency
 */
export type DealCardsService = ReturnType<typeof dealCardsService>;
