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

const coverDealAnimation = keyframes`
  0% {
    background-color: var(--team-color);
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
    color: white;
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

// Shared paper texture styles
const paperTextureStyles = css`
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
`;

/**
 * MOBILE-FIRST: Base styles for smallest screens
 */
const CardContainer = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  perspective: 1000px;
  margin: auto;
  z-index: 1;
  aspect-ratio: 2.4 / 3;
  padding: 10% 0; /* Add 10% padding to top and bottom */

  /* Base state - hidden until animated in */
  opacity: 0;

  /* State-based visibility */
  &[data-state="visible"],
  &[data-state="visible-colored"],
  &[data-state="covered"] {
    opacity: 1;
  }

  /* Raise z-index when animating or covered */
  &[data-state="covered"],
  &[data-animation="covering"] {
    z-index: 10;
  }

  /* Animation triggers */
  &[data-animation="dealing"] {
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  &[data-animation="color-fade"] .base-card {
    animation: ${colorRevealAnimation} 0.8s ease-in-out forwards;
  }
`;

/**
 * MOBILE-FIRST: Base card optimized for mobile readability
 */
const BaseCard = styled.button<{ $teamColor: string; $clickable: boolean }>`
  /* Mobile-first base styles */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 60px;
  aspect-ratio: 2.4 / 3;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #2a2a3e;
  font-family: sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.2rem;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: transform 0.2s;
  outline: none;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  will-change: transform;

  /* Mobile background - default beige */
  background: #f4f1e8;

  /* Mobile paper texture */
  ${paperTextureStyles}

  /* Mobile shadow - simplified */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.3);

  /* Mobile interactions */
  &:hover {
    transform: ${(props) => (props.$clickable ? "translateY(-2px)" : "none")};
  }

  &:active {
    transform: ${(props) => (props.$clickable ? "translateY(1px)" : "none")};
  }

  /* Mobile ripple effect */
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

  /* State-based colors for spymaster view */
  [data-state="visible-colored"] & {
    background-color: ${(props) =>
      props.$teamColor === CARD_COLORS.assassin
        ? "rgba(10, 10, 10, 0.9)"
        : props.$teamColor === CARD_COLORS.red
          ? "rgba(178, 34, 34, 0.85)"
          : props.$teamColor === CARD_COLORS.blue
            ? "rgba(65, 105, 225, 0.85)"
            : props.$teamColor === CARD_COLORS.bystander
              ? "rgba(105, 113, 136, 0.85)"
              : "rgba(73, 70, 70, 0.85)"};

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

  /* PROGRESSIVE ENHANCEMENT: Tablet improvements */
  @media (min-width: 481px) {
    min-height: 70px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    padding: 0.25rem;
    border-radius: 8px;

    /* Enhanced shadow for larger screens */
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 0 rgba(0, 0, 0, 0.2),
      0 6px 0 rgba(0, 0, 0, 0.2),
      0 7px 15px rgba(0, 0, 0, 0.3);
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop enhancements */
  @media (min-width: 769px) {
    min-height: 80px;
    font-size: 1rem;
    letter-spacing: 0.1em;
    padding: 0.5rem;

    /* Full desktop shadow stack */
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

    &:hover {
      transform: ${(props) => (props.$clickable ? "translateY(-4px)" : "none")};
    }
  }

  /* PROGRESSIVE ENHANCEMENT: Large desktop */
  @media (min-width: 1025px) {
    font-size: 1.2rem;
    min-height: 100px;
  }
`;

/**
 * MOBILE-FIRST: Cover card for selected states
 */
const CoverCard = styled.div<{
  $teamColor: string;
  $transformPx: { translateX: number; translateY: number; rotate: number };
}>`
  /* Mobile-first cover card */
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  height: 80%;
  border-radius: 6px;
  aspect-ratio: 2.4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform: translate(
      ${(props) => props.$transformPx.translateX}px,
      ${(props) => props.$transformPx.translateY}px
    )
    rotate(${(props) => props.$transformPx.rotate}deg) translateZ(10px);
  transform-style: preserve-3d;
  z-index: 2;
  opacity: 0;
  background-color: ${(props) => props.$teamColor};
  border: ${(props) =>
    props.$teamColor === CARD_COLORS.assassin
      ? "2px solid #ffff00"
      : "1px solid rgba(255, 255, 255, 0.3)"};
  pointer-events: none;

  /* Mobile shadow - simplified */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 5px rgba(0, 0, 0, 0.3);

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
    border-radius: 6px;
    opacity: 0;
    z-index: -1;
  }

  /* Trigger electric sweep when covering animation plays */
  &[data-animation="covering"][data-team-color="${CARD_COLORS.assassin}"]::before {
    animation: ${assassinSweep} 0.8s linear 0.7s forwards;
    opacity: 1;
  }

  /* Animation states */
  &[data-animation="covering"] {
    animation: ${coverDealAnimation} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards;
    opacity: 1;
  }

  &[data-state="covered"] {
    opacity: 1 !important;
    pointer-events: all;
  }

  /* PROGRESSIVE ENHANCEMENT: Tablet improvements */
  @media (min-width: 481px) {
    border-radius: 8px;
    border: ${(props) =>
      props.$teamColor === CARD_COLORS.assassin
        ? "2px solid #ffff00"
        : "1px solid rgba(255, 255, 255, 0.5)"};

    /* Enhanced shadow */
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 0 rgba(0, 0, 0, 0.25),
      0 4px 0 rgba(0, 0, 0, 0.25),
      0 5px 10px rgba(0, 0, 0, 0.4);
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop enhancements */
  @media (min-width: 769px) {
    border-radius: 12px;

    /* Full desktop shadow stack */
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
  }
`;

const CardContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
  padding: 0 0.5rem;
  z-index: 3;

  /* Mobile text shadow - simplified */
  text-shadow:
    0.5px 0.5px 0px rgba(255, 255, 255, 0.15),
    -0.5px -0.5px 0.5px rgba(0, 0, 0, 0.4);

  /* PROGRESSIVE ENHANCEMENT: Desktop text effects */
  @media (min-width: 769px) {
    padding: 0 1rem;
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
      drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));
  }
`;

const BackgroundIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.4);
  z-index: 0;
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));

  &.assassin {
    color: rgba(255, 255, 0, 0.5);
    text-shadow: 
      0 0 10px rgba(255, 255, 0, 0.4),
      0 0 20px rgba(255, 255, 0, 0.2);
    filter: drop-shadow(0 0 8px rgba(255, 255, 0, 0.5));
  }

  /* PROGRESSIVE ENHANCEMENT: Larger icons on bigger screens */
  @media (min-width: 481px) {
    font-size: 5rem;
    color: rgba(0, 0, 0, 0.45);
    
    &.assassin {
      color: rgba(255, 255, 0, 0.55);
    }
  }

  @media (min-width: 769px) {
    font-size: 7rem;
    color: rgba(0, 0, 0, 0.5);
    
    &.assassin {
      color: rgba(255, 255, 0, 0.6);
    }
  }
`;

const CenterIcon = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.6);
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.3),
    -1px -1px 1px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));

  &.assassin {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    filter: drop-shadow(0 0 12px rgba(255, 255, 0, 0.8));
    animation: ${electricFlicker} 2s ease-in-out infinite;
  }

  /* PROGRESSIVE ENHANCEMENT: Larger icons on bigger screens */
  @media (min-width: 481px) {
    font-size: 4rem;
    color: rgba(0, 0, 0, 0.7);
  }

  @media (min-width: 769px) {
    font-size: 6rem;
    color: rgba(0, 0, 0, 0.8);
    filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
      drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4))
      drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
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
 * Individual game card component with mobile-first responsive design
 */
export const GameCard = memo<GameCardProps>(
  ({ card, index, onClick, clickable, initialVisibility }) => {
    const teamColor = getCardColor(card);
    const visibility = useCardVisibility(card, index, initialVisibility);

    const coverTransform = useMemo(
      () => ({
        translateX: 0,
        translateY: 0,
        rotate: 0,
      }),
      [],
    );

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
          {getIcon(teamColor) && (
            <BackgroundIcon className={teamColor === CARD_COLORS.assassin ? "assassin" : ""}>
              {getIcon(teamColor)}
            </BackgroundIcon>
          )}

          <CardContent>{card.word}</CardContent>
        </BaseCard>

        <CoverCard
          className="cover-card"
          $teamColor={teamColor}
          $transformPx={coverTransform}
          data-team-color={teamColor}
          data-state={visibility.state}
          data-animation={visibility.animation}
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
