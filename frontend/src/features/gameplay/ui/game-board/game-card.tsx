import React, { memo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";

const FRONT_CARD_COLOUR = "#494646";

interface CardProps {
  backgroundColour?: string;
  children: React.ReactNode;
  clickable?: boolean;
}

const getIcon = (cardColor?: string) => {
  if (!cardColor) return null;

  if (cardColor.includes("#B22222")) return <FaStar />;
  if (cardColor.includes("#228B22")) return <FaLeaf />;
  if (cardColor.includes("#4169E1")) return <FaPeace />;
  if (cardColor.includes("#1d2023")) return <FaSkull />;
  return null;
};

export const getCardColor = (
  teamName?: string | null,
  cardType?: string,
): string => {
  const type = cardType || teamName;

  switch (type?.toLowerCase()) {
    case "assassin":
      return "#1d2023";
    case "bystander":
      return "#4169E1";
    case "team":
      if (teamName?.toLowerCase().includes("red")) return "#B22222";
      if (teamName?.toLowerCase().includes("blue")) return "#4169E1";
      if (teamName?.toLowerCase().includes("green")) return "#228B22";
      return "#B22222";
    default:
      return "#4b7fb3";
  }
};

const slideInAnimation = keyframes`
  0% {
    transform: translate(-2000px, -2000px);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`;

const sharedCardStyles = `
  height: 100%;
  width: 100%;
  border-radius: 12px;
  color: white;
  font-family: sans-serif;
  font-size: clamp(0.3rem, 2.5vw, 2rem);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3);
  background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 25%
    ),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
    radial-gradient(
      circle at 10% 20%,
      rgba(255, 255, 255, 0.05),
      transparent 20%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255, 255, 255, 0.05),
      transparent 20%
    );
  background-size: 10px 10px, 10px 10px;
  background-blend-mode: overlay;
`;

const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  position: relative;
  perspective: 1000px;
  margin: auto;
`;

const CardButton = styled.button<CardProps>`
  ${sharedCardStyles}
  background-color: ${(props) => props.backgroundColour || FRONT_CARD_COLOUR};
  transition: transform 0.2s;
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};

  &:hover {
    transform: ${(props) => (props.clickable ? "translateY(-4px)" : "none")};
  }

  &:active {
    transform: ${(props) => (props.clickable ? "translateY(1px)" : "none")};
  }
`;

const CardContent = styled.div<{ selected?: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
  padding: 0;
  text-decoration: ${(props) => (props.selected ? "line-through" : "none")};
`;

const CoverCard = styled.div<{
  backgroundColour?: string;
  animationDelay?: number;
  animate?: boolean;
}>`
  ${sharedCardStyles}
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${(props) => props.backgroundColour || FRONT_CARD_COLOUR};
  opacity: ${(props) => (props.animate ? 0 : 1)};
  animation: ${(props) =>
    props.animate
      ? `${slideInAnimation} 0.8s ease-out ${props.animationDelay || 0}s forwards`
      : "none"};
`;

const CornerIcon = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(0.5rem, 1vw, 2rem);
`;

export interface GameCardProps {
  card: Card;
  cardIndex: number;
  showTeamColors: boolean;
  clickable: boolean;
  isAnimating: boolean;
  onCardClick: (cardWord: string) => void;
}

export const GameCard = memo<GameCardProps>(
  ({
    card,
    cardIndex,
    showTeamColors,
    clickable,
    isAnimating,
    onCardClick,
  }) => {
    const cardColor = getCardColor(card.teamName, card.cardType);

    const handleClick = useCallback(() => {
      if (clickable && !card.selected) {
        onCardClick(card.word);
      }
    }, [clickable, card.selected, card.word, onCardClick]);

    return (
      <CardContainer>
        <CardButton
          onClick={clickable && !card.selected ? handleClick : undefined}
          clickable={clickable && !card.selected}
          backgroundColour={showTeamColors ? cardColor : FRONT_CARD_COLOUR}
          aria-label={`Card with text ${card.word}`}
        >
          <CardContent selected={card.selected}>{card.word}</CardContent>
        </CardButton>
        {card.selected && (
          <CoverCard
            animationDelay={cardIndex * 0.1}
            backgroundColour={cardColor}
            animate={isAnimating}
            aria-label="Selected card"
          >
            <CornerIcon>{getIcon(cardColor)}</CornerIcon>
          </CoverCard>
        )}
      </CardContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.card.word === nextProps.card.word &&
      prevProps.card.selected === nextProps.card.selected &&
      prevProps.card.teamName === nextProps.card.teamName &&
      prevProps.showTeamColors === nextProps.showTeamColors &&
      prevProps.clickable === nextProps.clickable &&
      prevProps.isAnimating === nextProps.isAnimating
    );
  },
);
