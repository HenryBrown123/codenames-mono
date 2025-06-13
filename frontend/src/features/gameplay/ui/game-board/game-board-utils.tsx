import { Card } from "@frontend/shared-types";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameCardProps } from "./game-card";
import styled from "styled-components";
import GameCard from "./game-card";

/**
 * RenderCards component renders a grid of game cards based on the provided props.
 */
type RenderCardsProps = {
  cards: Card[];
  stage: PlayerRole;
  readOnly?: boolean;
  showCodemasterView?: boolean;
  handleCardClick?: (cardData: Card) => void;
};

export const RenderCards: React.FC<RenderCardsProps> = ({
  cards,
  stage,
  readOnly = false,
  showCodemasterView = false,
  handleCardClick,
}) => (
  <CardsContainer aria-label="game board container with cards">
    {cards.map((cardData, index) => {
      const gameCardProps = getGameCardProps(
        cardData,
        stage,
        index,
        readOnly,
        showCodemasterView,
        () => handleCardClick && handleCardClick(cardData),
      );
      return (
        <GameCardContainer
          aria-label={`card for word: ${cardData.word}`}
          key={cardData.word}
        >
          <GameCard {...gameCardProps} />
        </GameCardContainer>
      );
    })}
  </CardsContainer>
);

/**
 * Get the color associated with a team/card type.
 */
export const getCardColor = (
  teamName?: string | null,
  cardType?: string,
): string => {
  // Use cardType if available, fall back to teamName
  const type = cardType || teamName;

  switch (type?.toLowerCase()) {
    case "assassin":
      return "#1d2023"; // Black
    case "bystander":
      return "#4169E1"; // Blue
    case "team":
      // For team cards, use teamName to determine color
      if (teamName?.toLowerCase().includes("red")) return "#B22222";
      if (teamName?.toLowerCase().includes("blue")) return "#4169E1";
      if (teamName?.toLowerCase().includes("green")) return "#228B22";
      return "#B22222"; // Default to red
    default:
      return "#4b7fb3"; // Default gray
  }
};

/**
 * Generate the properties for a game card component based on the provided card data and game context.
 */
export const getGameCardProps = (
  cardData: Card,
  gameStage: PlayerRole,
  cardIndex?: number,
  readOnly?: boolean,
  showCodemasterView?: boolean,
  handleClick?: () => void,
): GameCardProps => {
  // Determine if colors should be shown
  const shouldShowColors =
    showCodemasterView ||
    gameStage === PLAYER_ROLE.CODEMASTER ||
    cardData.selected;

  return {
    cardText: cardData.word,
    cardColor: getCardColor(cardData.teamName, cardData.cardType),
    clickable:
      gameStage === PLAYER_ROLE.CODEBREAKER && !cardData.selected && !readOnly,
    selected: cardData.selected,
    showTeamColorAsBackground: shouldShowColors,
    onClick: handleClick,
    cardIndex: cardIndex,
  };
};

const CardsContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 0.2em;
  align-items: stretch;
  justify-items: stretch;
`;

const GameCardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
