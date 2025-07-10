import { memo, useCallback, useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaStar, FaLeaf, FaSkull, FaPeace } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import type { VisualState } from "./card-visibility-provider";

// Card colors
const CARD_COLORS = {
  neutral: "#494646",
  assassin: "#0a0a0a",
  bystander: "#697188",
  red: "#B22222",
  blue: "#4169E1",
  green: "#228B22",
} as const;

/**
 * Gets icon for card based on color
 */
const getIcon = (cardColor: string) => {
  if (cardColor === CARD_COLORS.red) return <>★</>;
  if (cardColor === CARD_COLORS.blue) return <>♦</>;
  if (cardColor === CARD_COLORS.green) return <FaLeaf />;
  if (cardColor === CARD_COLORS.assassin) return <>☠</>;
  if (cardColor === CARD_COLORS.bystander) return <>●</>;
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

// Cover card dealing animation - only defines the start
const coverDealAnimation = keyframes`
  0% {
    transform: translateX(-100vw) translateY(-100vh) rotate(-180deg);
    opacity: 0;
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

const assassinSweep = keyframes`
  0% {
    background-position: -100% 50%;
    opacity: 1;
  }
  90% {
    background-position: 200% 50%;
    opacity: 1;
  }
  100% {
    background-position: 200% 50%;
    opacity: 0;
  }
`;

const electricFlicker = keyframes`
  0%, 100% {
    opacity: 0.6;
    filter: brightness(0.8);
  }
  10% {
    opacity: 1;
    filter: brightness(1.5);
  }
  20% {
    opacity: 0.7;
    filter: brightness(0.9);
  }
  30% {
    opacity: 1;
    filter: brightness(1.3);
  }
  50% {
    opacity: 1;
    filter: brightness(1.2);
  }
  70% {
    opacity: 0.8;
    filter: brightness(1);
  }
  90% {
    opacity: 1;
    filter: brightness(1.4);
  }
`;

const stampReveal = keyframes`
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(20deg);
  }
  75% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
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
  border-radius: 8px;
  color: #2a2a3e;
  font-family: sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
  border: 1px solid #d4d1c8;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 5px 0 rgba(0, 0, 0, 0.2),
    0 6px 0 rgba(0, 0, 0, 0.2),
    0 7px 0 rgba(0, 0, 0, 0.2),
    0 8px 0 rgba(0, 0, 0, 0.2),
    0 9px 0 rgba(0, 0, 0, 0.2),
    0 10px 0 rgba(0, 0, 0, 0.2),
    0 12px 20px rgba(0, 0, 0, 0.3);

  /* Base card color - default beige */
  background: #f4f1e8;

  /* State-based colors for spymaster view */
  [data-state="visible-colored"] & {
    background-color: var(--team-color);
    color: ${(props) => (props.$teamColor === CARD_COLORS.assassin ? "#ffffff" : "#2a2a3e")};
    border: ${(props) =>
      props.$teamColor === CARD_COLORS.assassin
        ? "2px solid #ffff00"
        : props.$teamColor === CARD_COLORS.red
          ? "2px solid #660000"
          : props.$teamColor === CARD_COLORS.blue
            ? "2px solid #002244"
            : props.$teamColor === CARD_COLORS.bystander
              ? "2px solid #333333"
              : "1px solid #d4d1c8"};
  }

  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: transform 0.2s;
  outline: none;
  overflow: hidden;
  position: relative;

  /* Force hardware acceleration */
  transform: translateZ(0);
  will-change: transform;

  /* Paper texture overlay */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="6" /%3E%3CfeColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.85 0 0 0 0.15 0"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)"/%3E%3C/svg%3E'),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.04) 2px,
        rgba(0, 0, 0, 0.04) 3px
      ),
      radial-gradient(ellipse at 20% 30%, rgba(139, 119, 101, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(139, 119, 101, 0.08) 0%, transparent 40%);
    background-size:
      150px 150px,
      4px 4px,
      200px 200px,
      180px 180px;
    opacity: 0.6;
    border-radius: 8px;
    pointer-events: none;
    z-index: 1;
  }

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
    z-index: 5;
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
const CoverCard = styled.div<{
  $teamColor: string;
  $transformPx: { translateX: number; translateY: number; rotate: number };
}>`
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

  /* This is the single source of truth for the final position */
  transform: translate(
      ${(props) => props.$transformPx.translateX}px,
      ${(props) => props.$transformPx.translateY}px
    )
    rotate(${(props) => props.$transformPx.rotate}deg) translateZ(10px);

  transform-style: preserve-3d;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 0 rgba(0, 0, 0, 0.25),
    0 4px 0 rgba(0, 0, 0, 0.25),
    0 5px 0 rgba(0, 0, 0, 0.25),
    0 6px 0 rgba(0, 0, 0, 0.25),
    0 7px 0 rgba(0, 0, 0, 0.25),
    0 8px 0 rgba(0, 0, 0, 0.25),
    0 10px 20px rgba(0, 0, 0, 0.4);
  z-index: 2;
  opacity: 0;
  background-color: ${(props) => props.$teamColor};
  border: ${(props) =>
    props.$teamColor === CARD_COLORS.assassin
      ? "2px solid #ffff00"
      : "1px solid rgba(255, 255, 255, 0.5)"};
  pointer-events: none;

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

  /* Electric border effect for assassin cards */
  &[data-team-color="${CARD_COLORS.assassin}"]::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      transparent 30%,
      #ffff00 40%,
      #00ffff 45%,
      #ffff00 50%,
      transparent 60%,
      transparent 100%
    );
    background-size: 300% 100%;
    background-position: -100% 50%;
    border-radius: 12px;
    opacity: 0;
    z-index: -1;
  }

  /* Trigger electric sweep when covering animation plays */
  [data-animation="covering"] &[data-team-color="${CARD_COLORS.assassin}"]::before {
    animation: ${assassinSweep} 0.8s linear 0.7s forwards;
    opacity: 1;
  }

  /* Animate FROM keyframe TO the transform defined above */
  [data-animation="covering"] & {
    animation: ${coverDealAnimation} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards;
    opacity: 1;
  }

  /* Stay visible when covered */
  [data-state="covered"] & {
    opacity: 1;
    pointer-events: all;
  }

  @media (max-width: 768px) {
    border-radius: 8px;
    border: ${(props) =>
      props.$teamColor === CARD_COLORS.assassin
        ? "2px solid #ffff00"
        : "1px solid rgba(255, 255, 255, 0.3)"};
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
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
  padding: 0;
  z-index: 1;

  /* Embossed text effect from prototype */
  text-shadow:
    0.5px 0.5px 0px rgba(255, 255, 255, 0.15),
    -0.5px -0.5px 0.5px rgba(0, 0, 0, 0.4);
  filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
    drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));

  /* Position at top of card */
  position: absolute;
  top: 2rem;
`;

const CenterIcon = styled.div`
  font-size: 4rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.4);
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.2),
    -1px -1px 1px rgba(0, 0, 0, 0.6);
  filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
    drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4));

  /* Assassin electric effect */
  &.assassin {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    animation: ${electricFlicker} 2s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SpymasterIcon = styled.div`
  position: absolute;
  bottom: 1.5rem;
  font-size: 4rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.4);
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.2),
    -1px -1px 1px rgba(0, 0, 0, 0.6);
  filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
    drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4));
  z-index: 2;
  opacity: 0;
  transform: scale(0) rotate(-180deg);

  /* Show and animate when in colored state */
  [data-state="visible-colored"] & {
    animation: ${stampReveal} 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards;
  }

  /* Assassin special styling */
  &.assassin {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
      drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4));
  }

  /* Electric flicker for assassin after stamp animation */
  [data-state="visible-colored"] &.assassin {
    animation:
      ${stampReveal} 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards,
      ${electricFlicker} 2s ease-in-out 0.8s infinite;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
    bottom: 1rem;
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

    // Simple random transform values
    const coverTransform = useMemo(
      () => ({
        translateX: Math.random() * 12 - 6,
        translateY: Math.random() * 12 - 6,
        rotate: Math.random() * 10 - 5,
      }),
      [],
    );

    /**
     * Completes the visibility transition after the animation ends.
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
          {visibility.state === "visible-colored" && getIcon(teamColor) && (
            <SpymasterIcon className={teamColor === CARD_COLORS.assassin ? "assassin" : ""}>
              {getIcon(teamColor)}
            </SpymasterIcon>
          )}
        </BaseCard>

        <CoverCard
          className="cover-card"
          $teamColor={teamColor}
          $transformPx={coverTransform}
          data-team-color={teamColor}
        >
          {getIcon(teamColor) && (
            <CenterIcon className={teamColor === CARD_COLORS.assassin ? "assassin" : ""}>
              {getIcon(teamColor)}
            </CenterIcon>
          )}
        </CoverCard>
      </CardContainer>
    );
  },
);

GameCard.displayName = "GameCard";
