import React, { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";

const FRONT_CARD_COLOUR = "#494646";

const getIcon = (cardColor?: string) => {
  if (!cardColor) return null;
  if (cardColor.includes("#B22222")) return <FaStar />;
  if (cardColor.includes("#228B22")) return <FaLeaf />;
  if (cardColor.includes("#4169E1")) return <FaPeace />;
  if (cardColor.includes("#1d2023")) return <FaSkull />;
  return null;
};

// Animations
const dealAnimation = keyframes`
  0% {
    transform: translateX(-100vw) translateY(-100vh) rotate(-6deg);
    opacity: 0;
  }
  60% {
    transform: translateX(0) translateY(0) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0);
    opacity: 1;
  }
`;

const coverAnimation = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
`;

// Styled Components
const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  position: relative;
  perspective: 1000px;
  margin: auto;
  
  &[data-animation="dealing"] {
    opacity: 0; /* Hide until animation starts */
    animation: ${dealAnimation} 0.7s calc(var(--index) * 75ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  &[data-animation="covering"] .card-inner {
    animation: ${coverAnimation} 0.6s ease-in-out forwards;
  }
`;

const CardInner = styled.div<{ $covered: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${props => props.$covered ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const sharedCardStyles = css`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  color: white;
  font-family: sans-serif;
  font-size: clamp(0.3rem, 2.5vw, 2rem);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3);
  backface-visibility: hidden;
  
  /* Force hardware acceleration */
  transform: translateZ(0);
  will-change: transform;
  
  /* Card texture */
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

const CardFront = styled.button<{ $backgroundColour: string; $clickable: boolean; $covered: boolean }>`
  ${sharedCardStyles}
  background-color: ${props => props.$backgroundColour};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s;
  transform: rotateY(0deg);
  
  &:hover {
    transform: ${props => props.$clickable && !props.$covered ? 'translateY(-4px)' : 'rotateY(0deg)'};
  }
  
  &:active {
    transform: ${props => props.$clickable && !props.$covered ? 'translateY(1px)' : 'rotateY(0deg)'};
  }
`;

const CoverCard = styled.div<{ $backgroundColour: string }>`
  ${sharedCardStyles}
  background-color: ${props => props.$backgroundColour};
  transform: rotateY(180deg);
`;

const CardContent = styled.div`
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
`;

const CornerIcon = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(0.5rem, 1vw, 2rem);
`;

// Helper function
export const getCardColor = (
  teamName?: string | null,
  cardType?: string,
): string => {
  const type = cardType || teamName;
  switch (type?.toLowerCase()) {
    case "assassin":
      return "#1d2023";
    case "bystander":
      return "#697188";
    case "team":
      if (teamName?.toLowerCase().includes("red")) return "#B22222";
      if (teamName?.toLowerCase().includes("blue")) return "#4169E1";
      if (teamName?.toLowerCase().includes("green")) return "#228B22";
      return "#B22222";
    default:
      return "#4b7fb3";
  }
};

// Memoized front face component
const CardFrontFace = memo<{
  word: string;
  backgroundColor: string;
  clickable: boolean;
  covered: boolean;
  onClick: () => void;
}>(({ word, backgroundColor, clickable, covered, onClick }) => {
  return (
    <CardFront
      onClick={onClick}
      $backgroundColour={backgroundColor}
      $clickable={clickable}
      $covered={covered}
      aria-label={`Card with text ${word}`}
    >
      <CardContent>{word}</CardContent>
    </CardFront>
  );
}, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.word === next.word &&
    prev.backgroundColor === next.backgroundColor &&
    prev.clickable === next.clickable &&
    prev.covered === next.covered
  );
});

CardFrontFace.displayName = "CardFrontFace";

// Memoized back face component
const CardBackFace = memo<{
  backgroundColor: string;
}>(({ backgroundColor }) => {
  const icon = getIcon(backgroundColor);
  return (
    <CoverCard $backgroundColour={backgroundColor}>
      {icon && <CornerIcon>{icon}</CornerIcon>}
    </CoverCard>
  );
}, (prev, next) => prev.backgroundColor === next.backgroundColor);

CardBackFace.displayName = "CardBackFace";

export interface GameCardProps {
  card: Card;
  cardIndex: number;
  animation: 'dealing' | 'covering' | null;
  onAnimationComplete: () => void;
  onCardClick: (cardWord: string) => void;
  clickable: boolean;
  showTeamColors: boolean;
}

/**
 * GameCard component with decoupled faces for smooth animations
 */
export const GameCard = memo<GameCardProps>(
  ({
    card,
    cardIndex,
    animation,
    onAnimationComplete,
    showTeamColors,
    clickable,
    onCardClick,
  }) => {
    const cardColor = getCardColor(card.teamName, card.cardType);
    
    const handleAnimationEnd = (e: React.AnimationEvent) => {
      if (e.target === e.currentTarget) {
        onAnimationComplete();
      }
    };
    
    const handleClick = useCallback(() => {
      if (clickable && !card.selected) {
        onCardClick(card.word);
      }
    }, [onCardClick, card, clickable]);
    
    return (
      <CardContainer 
        data-animation={animation}
        style={{ '--index': cardIndex } as React.CSSProperties}
        onAnimationEnd={handleAnimationEnd}
      >
        <CardInner className="card-inner" $covered={card.selected}>
          <CardFrontFace
            word={card.word}
            backgroundColor={showTeamColors ? cardColor : FRONT_CARD_COLOUR}
            clickable={clickable && !card.selected}
            covered={card.selected}
            onClick={handleClick}
          />
          
          <CardBackFace backgroundColor={cardColor} />
        </CardInner>
      </CardContainer>
    );
  },
  // Better memo comparison
  (prevProps, nextProps) => {
    return prevProps.card.word === nextProps.card.word &&
      prevProps.card.selected === nextProps.card.selected &&
      prevProps.card.teamName === nextProps.card.teamName &&
      prevProps.showTeamColors === nextProps.showTeamColors &&
      prevProps.clickable === nextProps.clickable &&
      prevProps.cardIndex === nextProps.cardIndex &&
      prevProps.animation === nextProps.animation;
  }
);

GameCard.displayName = "GameCard";