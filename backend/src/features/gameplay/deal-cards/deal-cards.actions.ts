import {
  RandomWordsSelector,
  CardsCreator,
  CardInput,
  CARD_TYPE,
  CardType,
} from "@backend/common/data-access/cards.repository";
import type { DealCardsValidGameState } from "./deal-cards.rules";
import { complexProperties } from "../state/gameplay-state.helpers";
import type { TeamId } from "@backend/common/data-access/teams.repository";

/**
 * Represents a position in the card grid with its assigned card type
 */
type CardPosition = {
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
 * Total: 25 cards (5x5 grid)
 */
const allocateInitialCardTypes = (
  startingTeam: TeamId,
  otherTeam: TeamId,
): CardPosition[] => [
  ...Array(9).fill({ cardType: CARD_TYPE.TEAM, teamId: startingTeam }),
  ...Array(8).fill({ cardType: CARD_TYPE.TEAM, teamId: otherTeam }),
  { cardType: CARD_TYPE.ASSASSIN },
  ...Array(7).fill({ cardType: CARD_TYPE.BYSTANDER }),
];

/**
 * Factory function that creates a card dealing action with repository dependencies
 *
 * @param getRandomWords - Repository function for retrieving random words
 * @param createCards - Repository function for creating new cards
 * @returns Function that deals cards for a validated game state
 */
export const dealCardsToRound = (
  getRandomWords: RandomWordsSelector,
  createCards: CardsCreator,
) => {
  /**
   * Lays out cards on the game grid for a pre-validated game state
   *
   * @param gameState - Validated game state that meets all business rules
   * @returns Laid out cards data with grid information
   */
  const layOutCards = async (gameState: DealCardsValidGameState) => {
    const latestRound = complexProperties.getLatestRound(gameState);
    const [team1, team2] = gameState.teams;

    // Determine starting team
    const startsFirst = Math.random() > 0.5;
    const [startingTeam, otherTeam] = startsFirst
      ? [team1.id, team2.id]
      : [team2.id, team1.id];

    // Allocate card types and randomize positions on the grid
    const cardsWithoutWords = allocateInitialCardTypes(startingTeam, otherTeam);
    const shuffledCards = shuffleCards(cardsWithoutWords);

    // Place words on the shuffled cards
    const words = await getRandomWords(shuffledCards.length);
    const cardInputs: CardInput[] = words.map((word, position) => ({
      roundId: latestRound.id,
      word,
      cardType: shuffledCards[position].cardType,
      teamId: shuffledCards[position].teamId,
    }));

    const cards = await createCards(cardInputs);

    // Calculate grid distribution
    const gridDistribution = {
      [startingTeam]: cards.filter((c) => c.teamId === startingTeam).length,
      [otherTeam]: cards.filter((c) => c.teamId === otherTeam).length,
      assassin: cards.filter((c) => c.cardType === CARD_TYPE.ASSASSIN).length,
      bystander: cards.filter((c) => c.cardType === CARD_TYPE.BYSTANDER).length,
    };

    return {
      roundId: latestRound.id,
      roundNumber: latestRound.roundNumber,
      startingTeam,
      otherTeam,
      gridSize: 25, // Standard 5x5 grid
      cardsLaidOut: cards.length,
      gridDistribution,
      cards,
    };
  };

  return layOutCards;
};
