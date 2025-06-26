// frontend/src/gameplay/game-board/game-card.tsx
import { memo, useCallback, useEffect } from "react";
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
  
  /* State-based animations */
  &[data-state="dealing"] {
    animation: ${dealAnimation} 0.8s calc(var(--index) * 50ms) cubic-bezier(0.4, 0, 0.2, 1) both;
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  
  /* Only flip when THIS card is covering */
  [data-state="covering"] & {
    animation: ${flipAnimation} 0.6s ease-in-out forwards;
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
  
  /* Restored card textures */
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
    
    // Debug log on every render
    useEffect(() => {
      console.log(`[CARD ${cardIndex}] "${card.word}" render:`, {
        state: animation.state,
        selected: card.selected,
        clickable,
        showTeamColors,
        cardColor,
        teamName: card.teamName,
        cardType: card.cardType,
        'animation.is': animation.is,
      });
    });
    
    // Log state changes
    useEffect(() => {
      console.log(`[CARD ${cardIndex}] "${card.word}" state changed to: ${animation.state}`);
    }, [animation.state, card.word, cardIndex]);
    
    // Log selection changes
    useEffect(() => {
      console.log(`[CARD ${cardIndex}] "${card.word}" selected changed to: ${card.selected}`);
    }, [card.selected, card.word, cardIndex]);
    
    // Auto-trigger deal animation on mount
    if (animation.is.hidden) {
      console.log(`[CARD ${cardIndex}] "${card.word}" triggering deal animation`);
      animation.actions.deal();
    }
    
    // When server confirms selection, transition to covering
    if (card.selected && animation.is.selecting) {
      console.log(`[CARD ${cardIndex}] "${card.word}" server confirmed selection, transitioning to covering`);
      animation.actions.cover();
    }
    
    const handleClick = useCallback(() => {
      console.log(`[CARD ${cardIndex}] "${card.word}" clicked!`, {
        currentState: animation.state,
        willSelect: animation.is.idle,
      });
      animation.actions.select();
      onCardClick(card.word);
    }, [animation, onCardClick, card.word, cardIndex]);
    
    // For 3D flip, we need both sides at all times
    const showFlipped = animation.is.covering || animation.is.covered;
    
    console.log(`[CARD ${cardIndex}] "${card.word}" render decision:`, {
      showFlipped,
      'animation.is.covering': animation.is.covering,
      'animation.is.covered': animation.is.covered,
      className: showFlipped ? 'flipped' : '',
    });
    
    // Handle animation end
    const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
      console.log(`[CARD ${cardIndex}] "${card.word}" animation ended:`, {
        animationName: e.animationName,
        target: e.target,
        currentTarget: e.currentTarget,
        isTargetCurrentTarget: e.target === e.currentTarget,
        currentState: animation.state,
      });
      animation.handleAnimationEnd(e);
    }, [animation, card.word, cardIndex]);
    
    return (
      <CardContainer 
        data-state={animation.state}
        style={{ '--index': cardIndex } as React.CSSProperties}
        onAnimationEnd={handleAnimationEnd}
      >
        <CardInner className={showFlipped ? 'flipped' : ''}>
          <CardFront
            onClick={clickable && !card.selected ? handleClick : undefined}
            $backgroundColour={showTeamColors ? cardColor : FRONT_CARD_COLOUR}
            $clickable={clickable && !card.selected}
            aria-label={`Card with text ${card.word}`}
          >
            <CardContent>{card.word}</CardContent>
          </CardFront>
          
          <CoverCard $backgroundColour={cardColor}>
            <CornerIcon>{getIcon(cardColor)}</CornerIcon>
          </CoverCard>
        </CardInner>
      </CardContainer>
    );
  },
  (prevProps, nextProps) => {
    const isEqual = prevProps.card.word === nextProps.card.word &&
      prevProps.card.selected === nextProps.card.selected &&
      prevProps.card.teamName === nextProps.card.teamName &&
      prevProps.showTeamColors === nextProps.showTeamColors &&
      prevProps.clickable === nextProps.clickable &&
      prevProps.cardIndex === nextProps.cardIndex;
    
    if (!isEqual) {
      console.log(`[CARD ${prevProps.cardIndex}] "${prevProps.card.word}" re-rendering due to prop change:`, {
        word: prevProps.card.word !== nextProps.card.word,
        selected: prevProps.card.selected !== nextProps.card.selected,
        teamName: prevProps.card.teamName !== nextProps.card.teamName,
        showTeamColors: prevProps.showTeamColors !== nextProps.showTeamColors,
        clickable: prevProps.clickable !== nextProps.clickable,
        cardIndex: prevProps.cardIndex !== nextProps.cardIndex,
      });
    }
    
    return isEqual;
  },
);

GameCard.displayName = "GameCard";