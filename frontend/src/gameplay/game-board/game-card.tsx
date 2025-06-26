import { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { useCardAnimation } from "./use-card-animation";

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
  to {
    text-decoration: line-through;
    opacity: 0.7;
  }
`;

const coverSlideIn = keyframes`
  from {
    transform: translateY(-100vh);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Styled Components
const CardContainer = styled.div<{ $index: number }>`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  position: relative;
  perspective: 1000px;
  margin: auto;
  
  /* State-based animations */
  &[data-state="dealing"] {
    animation: ${dealAnimation} 0.8s calc(${props => props.$index} * 50ms) cubic-bezier(0.4, 0, 0.2, 1) both;
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
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
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${props => props.$backgroundColour};
  z-index: 10;
  
  /* Animation based on parent state */
  [data-state="covering"] & {
    animation: ${coverSlideIn} 0.5s ease-out forwards;
  }
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
  
  /* Strike-through animation during selection */
  [data-state="selecting"] & {
    animation: ${strikeThrough} 0.3s ease-out forwards;
  }
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

export interface GameCardProps {
  card: Card;
  cardIndex: number;
  showTeamColors: boolean;
  clickable: boolean;
  onCardClick: (cardWord: string) => void;
}

/**
 * GameCard component with state-machine-driven animations.
 * Animations are triggered by state changes and completed via CSS animation events.
 */
export const GameCard = memo<GameCardProps>(
  ({
    card,
    cardIndex,
    showTeamColors,
    clickable,
    onCardClick,
  }) => {
    const animation = useCardAnimation(card.word);
    const cardColor = getCardColor(card.teamName, card.cardType);
    
    // Auto-trigger deal animation on mount
    if (animation.is.hidden) {
      animation.actions.deal();
    }
    
    // When server confirms selection, transition to covering
    if (card.selected && animation.is.selecting) {
      animation.actions.cover();
    }
    
    const handleClick = useCallback(() => {
      animation.actions.select();
      onCardClick(card.word);
    }, [animation, onCardClick, card.word]);
    
    // Show cover when in covering or covered state
    const shouldShowCover = animation.is.covering || animation.is.covered;
    
    return (
      <CardContainer 
        data-state={animation.state}
        $index={cardIndex}
        onAnimationEnd={animation.handleAnimationEnd}
      >
        <CardInner>
          <CardFront
            onClick={clickable && !card.selected ? handleClick : undefined}
            $backgroundColour={showTeamColors ? cardColor : FRONT_CARD_COLOUR}
            $clickable={clickable && !card.selected}
            aria-label={`Card with text ${card.word}`}
          >
            <CardContent>{card.word}</CardContent>
          </CardFront>
        </CardInner>
        
        {shouldShowCover && (
          <CoverCard $backgroundColour={cardColor}>
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
      prevProps.cardIndex === nextProps.cardIndex
    );
  },
);

GameCard.displayName = "GameCard";