import {
  RandomWordsSelector,
  CardsCreator,
  CardInput,
  CARD_TYPE,
  CardType,
} from "@backend/common/data-access/repositories/cards.repository";
import type { TeamId } from "@backend/common/data-access/repositories/teams.repository";

import type { DealCardsValidLobbyState } from "./deal-cards.rules";

/**
 * Factory function that creates a card dealing action with repository dependencies
 *
 * @param getRandomWords - Repository function for retrieving random words
 * @param replaceCards - Repository function for replacing cards in a round
 * @returns Function that deals cards for a validated game state
 */
export const dealCardsToRound = (
  getRandomWords: RandomWordsSelector,
  replaceCards: CardsCreator,
) => {
  /**
   * Lays out cards on the game grid for a pre-validated game state
   *
   * @param gameState - Validated game state that meets all business rules
   * @returns Laid out cards data with grid information
   */
  return async (gameState: DealCardsValidLobbyState) => {
    const [team1, team2] = gameState.teams;

    const startsFirst = Math.random() > 0.5;
    const [startingTeam, otherTeam] = startsFirst
      ? [team1._id, team2._id]
      : [team2._id, team1._id];

    const cardsWithoutWords = allocateInitialCardTypes(startingTeam, otherTeam);
    const shuffledCards = shuffleCards(cardsWithoutWords);

    const words = await getRandomWords(shuffledCards.length);

    const cardInputs: CardInput[] = words.map((word, position) => ({
      word,
      cardType: shuffledCards[position].cardType,
      teamId: shuffledCards[position].teamId,
    }));

    const cards = await replaceCards(gameState.currentRound._id, cardInputs);

    return {
      _roundId: gameState.currentRound._id,
      roundNumber: gameState.currentRound.number,
      startingTeam,
      otherTeam,
      cards,
    };
  };
};

/**
 * Represents a position in the card grid with its assigned card type
 */
type CardInfo = {
  cardType: CardType;
  teamId?: TeamId;
};

/**
 * Generic Fisher-Yates shuffle that works with any array type
 */
const shuffleCards = <T>(items: T[]): T[] => {
  const shuffled = [...items];

  // Start from the last position and work backwards
  for (let currentPos = shuffled.length - 1; currentPos > 0; currentPos--) {
    // Pick a random position from 0 to currentPos (inclusive)
    const swapPos = Math.floor(Math.random() * (currentPos + 1));
    // Swap the cards at these positions
    [shuffled[currentPos], shuffled[swapPos]] = [
      shuffled[swapPos],
      shuffled[currentPos],
    ];
  }

  return shuffled;
};

/**
 * Allocates the initial card type distribution before shuffling
 * - Starting team: 9 cards
 * - Other team: 8 cards
 * - Assassin: 1 card
 * - Bystander: 7 cards
 * Total: 25 cards
 */
const allocateInitialCardTypes = (
  startingTeam: TeamId,
  otherTeam: TeamId,
): CardInfo[] => [
  ...Array(9).fill({ cardType: CARD_TYPE.TEAM, teamId: startingTeam }),
  ...Array(8).fill({ cardType: CARD_TYPE.TEAM, teamId: otherTeam }),
  { cardType: CARD_TYPE.ASSASSIN },
  ...Array(7).fill({ cardType: CARD_TYPE.BYSTANDER }),
];

export type CardDealer = ReturnType<typeof dealCardsToRound>;
