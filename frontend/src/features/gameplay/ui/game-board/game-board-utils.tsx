import { Card, Stage, Team, TEAM } from "@frontend/shared-types";
import { STAGE } from "@codenames/shared/types";
import { GameCardProps } from "./game-card";
import styled from "styled-components";
import GameCard from "./game-card";

/**
 * RenderCards component renders a grid of game cards based on the provided props.
 *
 * @param {RenderCardsProps} props - The props for rendering cards, including the list of cards, current stage, read-only status, and click handler.
 */

type RenderCardsProps = {
  cards: Card[];
  stage: Stage;
  readOnly?: boolean;
  handleCardClick?: (cardData: Card) => void;
};

export const RenderCards: React.FC<RenderCardsProps> = ({
  cards,
  stage,
  readOnly,
  handleCardClick,
}) => (
  <CardsContainer aria-label="game board container with 25 cards">
    {cards.map((cardData, index) => {
      const gameCardProps = getGameCardProps(
        cardData,
        stage,
        index,
        readOnly,
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
 * Get the color associated with a team.
 *
 * @param {Team} team - The team whose color is needed.
 * @returns {string} - The hex color code for the team.
 */
export const getCardColor = (team: Team | undefined): string => {
  switch (team) {
    case TEAM.ASSASSIN:
      return "#1d2023";
    case TEAM.BYSTANDER:
      return "#4169E1";
    case TEAM.RED:
      return "#B22222";
    case TEAM.GREEN:
      return "#228B22";
    default:
      return "#4b7fb3";
  }
};

/**
 * Generate the properties for a game card component based on the provided card data, game stage, and read-only status.
 *
 * @param {Card} cardData - The data for the card.
 * @param {Stage} gameStage - The current stage of the game.
 * @param {boolean} [readOnly] - Whether the game is in read-only mode.
 * @param {() => void} [handleClick] - The click handler for the card.
 * @returns {GameCardProps} - The properties for the GameCard component.
 */
export const getGameCardProps = (
  cardData: Card,
  gameStage: Stage,
  cardIndex?: number,
  readOnly?: boolean,
  handleClick?: () => void,
): GameCardProps => {
  return {
    cardText: cardData.word,
    cardColor: getCardColor(cardData.team),
    clickable:
      gameStage === STAGE.CODEBREAKER && !cardData.selected && !readOnly,
    selected: cardData.selected,
    showTeamColorAsBackground: !readOnly && gameStage === STAGE.CODEMASTER,
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
