import React, { memo, useCallback } from "react";
import { Card } from "@frontend/shared-types";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameCardProps } from "./game-card";
import styled from "styled-components";
import GameCard from "./game-card";

/**
 * RenderCards component renders a grid of game cards based on the provided props.
 * OPTIMIZED: Stable props, memoized card components, simplified callback pattern
 */
type RenderCardsProps = {
  cards: Card[];
  stage: PlayerRole;
  readOnly?: boolean;
  showCodemasterView?: boolean;
  onCardClick?: (cardWord: string) => void; // 🎯 SIMPLIFIED: Just pass the word
  disabled?: boolean;
};

/**
 * Individual card wrapper with stable props
 * CRITICAL: This prevents every card from re-rendering when one card changes
 */
const MemoizedCardWrapper: React.FC<{
  card: Card;
  cardIndex: number;
  gameCardProps: GameCardProps;
  onCardClick?: (cardWord: string) => void;
}> = memo(({ card, cardIndex, gameCardProps, onCardClick }) => {
  // 🎯 STABLE CALLBACK: Only depends on card.word, not the entire card object
  const handleClick = useCallback(() => {
    if (onCardClick && gameCardProps.clickable && !gameCardProps.selected) {
      onCardClick(card.word);
    }
  }, [onCardClick, card.word, gameCardProps.clickable, gameCardProps.selected]);

  return (
    <GameCardContainer
      aria-label={`card for word: ${card.word}`}
      key={card.word}
    >
      <GameCard
        {...gameCardProps}
        onClick={gameCardProps.clickable ? handleClick : undefined}
      />
    </GameCardContainer>
  );
});

export const RenderCards: React.FC<RenderCardsProps> = memo(
  ({
    cards,
    stage,
    readOnly = false,
    showCodemasterView = false,
    onCardClick,
    disabled = false,
  }) => (
    <CardsContainer aria-label="game board container with cards">
      {cards.map((card, index) => {
        const gameCardProps = getGameCardProps(
          card,
          stage,
          index,
          readOnly,
          showCodemasterView,
          disabled,
        );

        return (
          <MemoizedCardWrapper
            key={card.word} // STABLE KEY
            card={card}
            cardIndex={index}
            gameCardProps={gameCardProps}
            onCardClick={onCardClick}
          />
        );
      })}
    </CardsContainer>
  ),
);

/**
 * Get the color associated with a team/card type.
 * OPTIMIZATION: This function is pure, no changes needed
 */
export const getCardColor = (
  teamName?: string | null,
  cardType?: string,
): string => {
  const type = cardType || teamName;

  switch (type?.toLowerCase()) {
    case "assassin":
      return "#1d2023"; // Black
    case "bystander":
      return "#4169E1"; // Blue
    case "team":
      if (teamName?.toLowerCase().includes("red")) return "#B22222";
      if (teamName?.toLowerCase().includes("blue")) return "#4169E1";
      if (teamName?.toLowerCase().includes("green")) return "#228B22";
      return "#B22222"; // Default to red
    default:
      return "#4b7fb3"; // Default gray
  }
};

/**
 * Generate the properties for a game card component.
 * OPTIMIZED: Removed handleClick param, simplified logic
 */
export const getGameCardProps = (
  cardData: Card,
  gameStage: PlayerRole,
  cardIndex?: number,
  readOnly?: boolean,
  showCodemasterView?: boolean,
  disabled?: boolean,
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
      !disabled &&
      gameStage === PLAYER_ROLE.CODEBREAKER &&
      !cardData.selected &&
      !readOnly,
    selected: cardData.selected,
    showTeamColorAsBackground: shouldShowColors,
    cardIndex: cardIndex,
    // onClick will be handled by MemoizedCardWrapper
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
