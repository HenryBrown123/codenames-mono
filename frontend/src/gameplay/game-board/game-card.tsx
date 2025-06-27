import React, { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { CardAnimationControl } from "./use-board-animations";

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
    transform: translateY(-100vh) rotate(720deg) scale(0);
    opacity: 0;
  }
  60% {
    transform: translateY(0) rotate(360deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(0) scale(1);
    opacity: 1;
  }
`;

const strikeThrough = keyframes`
  0% {
    text-decoration: none;
    opacity: 1;
  }
  100% {
    text-decoration: line-through;
    text-decoration-thickness: 3px;
    text-decoration-color: rgba(255, 0, 0, 0.8);
    opacity: 0.7;
  }
`;

const flipAnimation = keyframes`
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
  
  /* Initial hidden state */
  &[data-state="hidden"] {
    opacity: 0;
    transform: translateY(-100vh) scale(0);
  }
  
  /* Dealing animation */
  &[data-state="dealing"] {
    animation: ${dealAnimation} 0.8s calc(var(--index) * 50ms) cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  /* Other states */
  &[data-state="idle"],
  &[data-state="selecting"],
  &[data-state="covering"],
  &[data-state="covered"] {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  
  /* Stagger the flip animation slightly */
  [data-state="covering"] & {
    animation: ${flipAnimation} 0.6s calc(var(--index) * 20ms) ease-in-out forwards;
  }
  
  [data-state="covered"] & {
    transform: rotateY(180deg);
  }
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

const CardFront = styled.button<{ $backgroundColour: string; $clickable: boolean }>`
  ${sharedCardStyles}
  background-color: ${props => props.$backgroundColour};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s;
  
  [data-state="idle"] &:hover {
    transform: ${props => props.$clickable ? 'translateY(-4px)' : 'none'};
  }
  
  &:active {
    transform: ${props => props.$clickable ? 'translateY(1px)' : 'none'};
  }
`;

const CoverCard = styled.div<{ $backgroundColour: string }>`
  ${sharedCardStyles}
  background-color: ${props => props.$backgroundColour};
  transform: rotateY(180deg);
`;

const CardContent = styled.div<{ $isSelecting: boolean }>`
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
  
  /* Strike-through animation - controlled by prop not parent state */
  ${props => props.$isSelecting && css`
    animation: ${strikeThrough} 0.4s ease-out forwards;
  `}
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
  isSelecting: boolean;
  onClick: () => void;
}>(({ word, backgroundColor, clickable, isSelecting, onClick }) => {
  return (
    <CardFront
      onClick={onClick}
      $backgroundColour={backgroundColor}
      $clickable={clickable}
      aria-label={`Card with text ${word}`}
    >
      <CardContent $isSelecting={isSelecting}>{word}</CardContent>
    </CardFront>
  );
}, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.word === next.word &&
    prev.backgroundColor === next.backgroundColor &&
    prev.clickable === next.clickable &&
    prev.isSelecting === next.isSelecting
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
  cardId: string;
  animation: CardAnimationControl;
  onAnimationEnd: (e: React.AnimationEvent) => void;
  showTeamColors: boolean;
  clickable: boolean;
  onCardClick: (cardWord: string) => void;
}

/**
 * GameCard component with decoupled faces for smooth animations
 */
export const GameCard = memo<GameCardProps>(
  ({
    card,
    cardIndex,
    cardId,
    animation,
    onAnimationEnd,
    showTeamColors,
    clickable,
    onCardClick,
  }) => {
    const cardColor = getCardColor(card.teamName, card.cardType);
    
    const handleClick = useCallback(() => {
      console.log(`[CARD ${cardIndex}] Click attempt:`, {
        clickable,
        selected: card.selected,
        state: animation.state,
        isIdle: animation.is.idle
      });
      
      if (!clickable || card.selected || !animation.is.idle) {
        console.log(`[CARD ${cardIndex}] Click blocked`);
        return;
      }
      
      console.log(`[CARD ${cardIndex}] "${card.word}" clicked - triggering select`);
      animation.actions.select();
      onCardClick(card.word);
    }, [animation, onCardClick, card, cardIndex, clickable]);
    
    // Debug: Log state changes
    React.useEffect(() => {
      console.log(`[CARD ${cardIndex}] State changed to: ${animation.state}`);
    }, [animation.state, cardIndex]);
    
    return (
      <CardContainer 
        data-state={animation.state}
        style={{ '--index': cardIndex } as React.CSSProperties}
        onAnimationEnd={onAnimationEnd}
      >
        <CardInner style={{ '--index': cardIndex } as React.CSSProperties}>
          <CardFrontFace
            word={card.word}
            backgroundColor={showTeamColors ? cardColor : FRONT_CARD_COLOUR}
            clickable={clickable && !card.selected && animation.is.idle}
            isSelecting={animation.is.selecting}
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
      prevProps.cardId === nextProps.cardId &&
      prevProps.animation.state === nextProps.animation.state;
  }
);

GameCard.displayName = "GameCard";