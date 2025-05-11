import {
  RandomWordsSelector,
  CardsCreator,
} from "@backend/common/data-access/cards.repository";

import {
  TeamsFinder,
  GameId,
} from "@backend/common/data-access/teams.repository";

import { GameplayStateProvider } from "../state/gameplay-state.provider";

import { dealCardsToRound } from "./deal-cards.actions";
import { dealCardsController } from "./deal-cards.controller";
import { dealCardsService } from "./deal-cards.service";

/**
 * Dependencies required by the deal cards feature module
 */
export interface DealCardsDependencies {
  getGameState: GameplayStateProvider;
  getRandomWords: RandomWordsSelector;
  createCards: CardsCreator;
}

/**
 * Feature module for dealing cards in a game
 *
 * This module encapsulates all the components needed for the deal cards feature:
 * - Actions: Domain logic for dealing cards
 * - Services: Gameplay logic and orchestration
 * - Controllers: HTTP request handling
 *
 * @param dependencies - External dependencies required by this feature
 * @returns Object containing the assembled components of the feature
 */
export const dealCards = (dependencies: DealCardsDependencies) => {
  const dealCardsAction = dealCardsToRound(
    dependencies.getRandomWords,
    dependencies.createCards,
  );

  const dealCardsServiceInstance = dealCardsService({
    getGameState: dependencies.getGameState,
    dealCardsFromValidState: dealCardsAction,
  });

  const controller = dealCardsController({
    dealCards: dealCardsServiceInstance,
  });

  return {
    controller,
    service: dealCardsServiceInstance,
  };
};

export default dealCards;
