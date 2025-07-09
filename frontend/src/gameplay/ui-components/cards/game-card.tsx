import { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import type { VisualState } from "./card-visibility-provider";

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

// Cover card dealing animation from prototype
const coverDealAnimation = keyframes`
  0% {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px) translateX(-100vw) translateY(-100vh) rotate(-6deg);
    opacity: 0;
  }
  60% {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px) translateX(0) translateY(0) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px);
    opacity: 1;
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
  &[data-state="covered"] {
    z-index: 10;
  }

  &[data-animation="covering"] {
    z-index: 10;
  }

  /* Base state styles */
  opacity: 0;

  /* State-based visibility */
  &[data-state="visible"],
  &[data-state="visible-colored"],
  &[data-state="covered"] {
    opacity: 1;
  }

  /* Animation triggers */
  &[data-animation="dealing"] {
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  &[data-animation="color-fade"] .base-card {
    animation: ${colorRevealAnimation} 0.8s ease-in-out forwards;
  }

  @media (max-width: 768px) {
    min-height: 0;
    min-width: 0;
  }
`;

// Base card that's always visible
const BaseCard = styled.button<{ $teamColor: string; $clickable: boolean }>`
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

  /* Base card color */
  background-color: ${CARD_COLORS.neutral};

  /* State-based colors */
  [data-state="visible-colored"] & {
    background-color: var(--team-color);
  }

  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: transform 0.2s;
  outline: none;
  overflow: hidden;
  position: relative;

  /* Force hardware acceleration */
  transform: translateZ(0);
  will-change: transform;

  /* Card texture */
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05), transparent 20%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05), transparent 20%);
  background-size:
    10px 10px,
    10px 10px;
  background-blend-mode: overlay;
  word-break: break-word;
  overflow-wrap: break-word;

  /* Hover effect */
  &:hover {
    transform: ${(props) => (props.$clickable ? "translateY(-4px)" : "none")};
  }

  &:active {
    transform: ${(props) => (props.$clickable ? "translateY(1px)" : "none")};
  }

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
    transition:
      transform 0.5s,
      opacity 0.5s;
  }

  &:active::before {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
    animation: ${rippleEffect} 0.6s ease-out;
  }

  @media (max-width: 1024px) {
    font-size: clamp(0.7rem, 2.8vw, 1.5rem);
  }

  @media (max-width: 768px) {
    font-size: clamp(0.6rem, 3vw, 1rem);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 480px) {
    font-size: clamp(0.5rem, 2.5vw, 0.9rem);
    border-radius: 6px;
  }
`;

// Cover card that appears on top when selected
const CoverCard = styled.div<{ $teamColor: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform: translate(8px, -8px) rotate(3deg) translateZ(10px);
  transform-style: preserve-3d;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3);
  z-index: 2;
  opacity: 0;
  background-color: ${(props) => props.$teamColor};
  border: 1px solid rgba(255, 255, 255, 0.5);
  pointer-events: none; /* Don't block clicks when invisible */

  /* Card texture - same as base */
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05), transparent 20%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05), transparent 20%);
  background-size:
    10px 10px,
    10px 10px;
  background-blend-mode: overlay;

  /* Animate in when covering */
  [data-animation="covering"] & {
    animation: ${coverDealAnimation} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  /* Stay visible when covered */
  [data-state="covered"] & {
    opacity: 1;
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px);
    pointer-events: all; /* Re-enable pointer events when visible */
  }

  @media (max-width: 768px) {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 480px) {
    border-radius: 6px;
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
`;

const CenterIcon = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(2rem, 4vw, 4rem);

  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }
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
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, initialVisibility }) => {
    const teamColor = getCardColor(card);
    const visibility = useCardVisibility(card, index, initialVisibility);

    /**
     * Completes the visibiblity transition after the animation ends.
     */
    const handleAnimationEnd = useCallback(
      (e: React.AnimationEvent) => {
        if (e.target === e.currentTarget && visibility.animation) {
          visibility.completeTransition();
        }
      },
      [visibility.animation, visibility.completeTransition],
    );

    const handleClick = useCallback(() => {
      if (clickable && !card.selected) {
        onClick();
      }
    }, [clickable, card.selected, onClick]);

    return (
      <CardContainer
        data-state={visibility.state}
        data-animation={visibility.animation}
        style={{ "--card-index": index, "--team-color": teamColor } as React.CSSProperties}
        onAnimationEnd={handleAnimationEnd}
      >
        <BaseCard
          className="base-card"
          $teamColor={teamColor}
          $clickable={clickable && !card.selected}
          onClick={handleClick}
          disabled={!clickable || card.selected}
          aria-label={`Card: ${card.word}`}
        >
          <CardContent>{card.word}</CardContent>
        </BaseCard>

        <CoverCard className="cover-card" $teamColor={teamColor}>
          {getIcon(teamColor) && <CenterIcon>{getIcon(teamColor)}</CenterIcon>}
        </CoverCard>
      </CardContainer>
    );
  },
);

GameCard.displayName = "GameCard";
