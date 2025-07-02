import { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from './use-card-visibility';
import type { VisualState } from './card-visibility-provider';

// Card colors
const CARD_COLORS = {
  neutral: "#494646",
  assassin: "#1d2023",
  bystander: "#697188",
  red: "#B22222",
  blue: "#4169E1",
  green: "#228B22",
} as const;

/**
 * Gets icon for card based on color
 */
const getIcon = (cardColor: string) => {
  if (cardColor === CARD_COLORS.red) return <FaStar />;
  if (cardColor === CARD_COLORS.green) return <FaLeaf />;
  if (cardColor === CARD_COLORS.blue) return <FaPeace />;
  if (cardColor === CARD_COLORS.assassin) return <FaSkull />;
  return null;
};

/**
 * Gets the appropriate color for a card based on its type and team
 */
const getCardColor = (card: Card): string => {
  if (card.cardType === "ASSASSIN") return CARD_COLORS.assassin;
  if (card.cardType === "BYSTANDER") return CARD_COLORS.bystander;
  
  const team = card.teamName?.toLowerCase();
  if (team?.includes("red")) return CARD_COLORS.red;
  if (team?.includes("blue")) return CARD_COLORS.blue;
  if (team?.includes("green")) return CARD_COLORS.green;
  
  return CARD_COLORS.neutral;
};

// Animations
const rippleEffect = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.7;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

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

const colorRevealAnimation = keyframes`
  0% {
    background-color: ${CARD_COLORS.neutral};
  }
  100% {
    background-color: var(--team-color);
  }
`;

// Styled Components
const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  perspective: 1000px;
  margin: auto;
  z-index: 1;
  
  /* Raise z-index when animating or covered */
  &[data-state="revealed"] {
    z-index: 10;
  }
  
  &[data-animation="reveal"] {
    z-index: 10;
  }
  
  /* Base state styles */
  opacity: 0;
  
  /* State-based visibility */
  &[data-state="visible"],
  &[data-state="dealing"],
  &[data-state="selected"],
  &[data-state="revealed"] {
    opacity: 1;
  }
  
  /* State-based card colors */
  &[data-state="visible"] .card-front {
    background-color: ${CARD_COLORS.neutral};
  }
  
  &[data-state="dealing"] .card-front {
    background-color: ${CARD_COLORS.neutral};
  }
  
  &[data-state="selected"] .card-front {
    background-color: var(--team-color);
  }
  
  &[data-state="revealed"] .card-front {
    background-color: var(--team-color);
  }
  
  /* Animation triggers */
  &[data-animation="deal"] {
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  &[data-animation="reveal"] .card-inner {
    animation: ${coverAnimation} 0.6s ease-in-out forwards;
  }
  
  &[data-animation="select"] .card-front {
    animation: ${colorRevealAnimation} 0.8s ease-in-out forwards;
  }
`;

const CardInner = styled.div<{ $clickable: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: transform 0.6s;
  
  /* Hover effect on the entire card inner */
  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-4px)' : 'none'};
  }
  
  &:active {
    transform: ${props => props.$clickable ? 'translateY(1px)' : 'none'};
  }
  
  /* Flip when revealed */
  [data-state="revealed"] & {
    transform: rotateY(180deg);
  }
  
  /* Combine transforms when revealed and hovering */
  [data-state="revealed"] &:hover {
    transform: rotateY(180deg);
  }
`;

const cardFaceStyles = css`
  position: absolute;
  top: 0;
  left: 0;
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
  word-break: break-word;
  overflow-wrap: break-word;
`;

const CardFront = styled.button<{ $teamColor: string; $clickable: boolean }>`
  ${cardFaceStyles}
  
  /* Default background - will be overridden by state */
  background-color: ${CARD_COLORS.neutral};
  
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s;
  outline: none;
  overflow: hidden;
  position: relative;
  
  /* Ripple effect */
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300%;
    height: 300%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%) scale(0);
    border-radius: 50%;
    opacity: 0;
    transition: transform 0.5s, opacity 0.5s;
  }

  &:active::before {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
    animation: ${rippleEffect} 0.6s ease-out;
  }
`;

const CardBack = styled.div<{ $teamColor: string }>`
  ${cardFaceStyles}
  background-color: ${props => props.$teamColor};
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

/**
 * GameCard component props
 */
export interface GameCardProps {
  card: Card;
  index: number;
  onClick: () => void;
  clickable: boolean;
  initialVisibility: VisualState;
}

/**
 * Individual game card component with state-based styling
 */
export const GameCard = memo<GameCardProps>(({
  card,
  index,
  onClick,
  clickable,
  initialVisibility,
}) => {
  const teamColor = getCardColor(card);
  const visibility = useCardVisibility(card, index, initialVisibility);
  
  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    // Only handle animations on the container element
    if (e.target === e.currentTarget && visibility.animation) {
      visibility.completeTransition();
    }
  }, [visibility.animation, visibility.completeTransition]);
  
  const handleClick = useCallback(() => {
    if (clickable && !card.selected) {
      onClick();
    }
  }, [clickable, card.selected, onClick]);
  
  return (
    <CardContainer 
      data-state={visibility.state}
      data-animation={visibility.animation}
      style={{ '--card-index': index, '--team-color': teamColor } as React.CSSProperties}
      onAnimationEnd={handleAnimationEnd}
    >
      <CardInner 
        className="card-inner" 
        $clickable={clickable && !card.selected}
      >
        <CardFront
          className="card-front"
          $teamColor={teamColor}
          $clickable={clickable && !card.selected}
          onClick={handleClick}
          disabled={!clickable || card.selected}
          aria-label={`Card: ${card.word}`}
        >
          <CardContent>{card.word}</CardContent>
        </CardFront>
        <CardBack $teamColor={teamColor} className="card-back">
          {getIcon(teamColor) && <CornerIcon>{getIcon(teamColor)}</CornerIcon>}
        </CardBack>
      </CardInner>
    </CardContainer>
  );
});

GameCard.displayName = 'GameCard';