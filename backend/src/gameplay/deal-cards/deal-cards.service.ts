import type { GameplayStateProvider } from "../state/gameplay-state.provider";
import type { GameplayValidationError } from "../state/gameplay-state.validation";
import type { TransactionalGameplayHandler } from "../actions/gameplay-actions.handler";
import type { CardResult } from "@backend/common/data-access/cards.repository";

import { validate as checkCardDealingRules } from "./deal-cards.rules";

/**
 * Input parameters for dealing cards
 */
export type DealCardsInput = {
  gameId: string;
  userId: number;
};

/**
 * Successful card dealing result
 */
export type DealCardsSuccess = {
  _roundId: number;
  roundNumber: number;
  _startingTeamId: number;
  cards: CardResult[];
};

/**
 * Card dealing error types
 */
export const DEAL_CARDS_ERROR = {
  INVALID_GAME_STATE: "invalid-game-state",
  GAME_NOT_FOUND: "game-not-found",
} as const;

/**
 * Card dealing failure details
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
    };

/**
 * Combined result type for card dealing
 */
export type DealCardsResult =
  | { success: true; data: DealCardsSuccess }
  | { success: false; error: DealCardsFailure };

/**
 * Dependencies required by the deal cards service
 */
export type DealCardsDependencies = {
  getGameState: GameplayStateProvider;
  gameplayHandler: TransactionalGameplayHandler;
};

/**
 * Creates a service for handling card dealing with business rule validation
 *
 * @param dependencies - Required external dependencies
 * @returns Service function for dealing cards
 */
export const dealCardsService = (dependencies: DealCardsDependencies) => {
  return async (input: DealCardsInput): Promise<DealCardsResult> => {
    const gameData = await dependencies.getGameState(
      input.gameId,
      input.userId,
    );

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

    const dealtCards = await dependencies.gameplayHandler(async (game) => {
      return await game.dealCards(validationResult.data);
    });

    return {
      success: true,
      data: {
        _roundId: dealtCards._roundId,
        roundNumber: dealtCards.roundNumber,
        _startingTeamId: dealtCards.startingTeam,
        cards: dealtCards.cards,
      },
    };
  };
};

export type DealCardsService = ReturnType<typeof dealCardsService>;
