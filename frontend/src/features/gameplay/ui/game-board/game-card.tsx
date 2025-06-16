import React, { memo } from "react";
import styled, { keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { useGameplayContext } from "@frontend/features/gameplay/state";

const FRONT_CARD_COLOUR = "#494646";

interface CardProps {
  backgroundColour?: string;
  children: React.ReactNode;
  clickable?: boolean;
  codemasterView?: boolean;
}

const getIcon = (color?: string) => {
  switch (color) {
    case "red":
      return <FaStar />;
    case "green":
      return <FaLeaf />;
    case "blue":
      return <FaPeace />;
    case "black":
      return <FaSkull />;
    default:
      return null;
  }
};

const slideInAnimation = keyframes`
  0% {
    transform: translate(-2000px, -2000px);
  }
  100% {
    transform: translate(0, 0);
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

const Card = styled.button<CardProps>`
  ${sharedCardStyles}
  background-color: ${(props) =>
    props.backgroundColour ? props.backgroundColour : FRONT_CARD_COLOUR};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(1px);
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
  opacity: 1;
  animation: ${(props) =>
    props.animate
      ? `${slideInAnimation} 0.8s ease-out ${props.animationDelay || 0}s`
      : "none"};
`;

const CornerIcon = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(0.5rem, 1vw, 2rem);

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

export interface GameCardProps {
  cardText: string;
  cardColor?: string;
  showTeamColorAsBackground: boolean;
  clickable: boolean;
  selected?: boolean;
  cardIndex?: number;
  onClick?: () => void;
}

/**
 * GameCard component with animation triggered by gameplay context
 */
const GameCard: React.FC<GameCardProps> = memo((props) => {
  const {
    cardText,
    cardColor,
    showTeamColorAsBackground,
    clickable = false,
    selected = false,
    cardIndex,
    onClick,
  } = props;

  const { animatingCard } = useGameplayContext();

  // Only animate if this specific card is the one being animated
  const shouldAnimate = animatingCard === cardText && selected;

  const handleClick = () => {
    if (clickable && onClick && !selected) {
      onClick();
    }
  };

  return (
    <CardContainer>
      <Card
        onClick={clickable && !selected ? handleClick : undefined}
        clickable={clickable}
        backgroundColour={
          showTeamColorAsBackground ? cardColor : FRONT_CARD_COLOUR
        }
        aria-label={`Card with text ${cardText}`}
      >
        <CardContent selected={selected}>{cardText}</CardContent>
      </Card>
      {selected && (
        <CoverCard
          animationDelay={(cardIndex || 0) * 0.1}
          backgroundColour={cardColor}
          animate={shouldAnimate}
          aria-label="Selected card"
        >
          <CornerIcon>{getIcon(cardColor)}</CornerIcon>
        </CoverCard>
      )}
    </CardContainer>
  );
});

export default GameCard;
