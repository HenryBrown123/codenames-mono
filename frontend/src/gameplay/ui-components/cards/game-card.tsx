import { memo, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import { FaCaretDown, FaMoon, FaMinus } from "react-icons/fa";
import { Card } from "@frontend/shared-types";
import { useCardVisibility } from "./use-card-visibility";
import type { VisualState } from "./card-visibility-provider";

// Card colors
const CARD_COLORS = {
  neutral: "#f4f1e8",
  assassin: "#0a0a0a",
  bystander: "#999088",
  red: "#b85555",
  blue: "#5588b8",
  green: "#228B22",
} as const;

/**
 * Gets icon for card based on color
 */
const getIcon = (cardColor: string) => {
  if (cardColor === CARD_COLORS.red) return <FaCaretDown />;
  if (cardColor === CARD_COLORS.blue) return <FaMoon />;
  if (cardColor === CARD_COLORS.assassin) return "☠";
  return <FaMinus />;
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


const dealCoverAnimation = keyframes`
  from {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px) translateX(-100vw) translateY(-100vh) rotate(-6deg);
    opacity: 0;
    visibility: visible;
  }
  60% {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px) translateX(0) translateY(0) rotate(2deg);
    opacity: 1;
    visibility: visible;
  }
  to {
    transform: translate(8px, -8px) rotate(3deg) translateZ(10px);
    opacity: 1;
    visibility: visible;
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
  z-index: 10;

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


  /* State-based card colors */
  &[data-state="visible"] .card-front {
    background-color: ${CARD_COLORS.neutral};
  }

  &[data-state="visible-colored"] .card-front {
    background-color: var(--team-color);
    
    &.team-red {
      background: ${CARD_COLORS.red};
      border: 2px solid #660000;
    }
    
    &.team-blue {
      background: ${CARD_COLORS.blue};
      border: 2px solid #002244;
    }
    
    &.team-neutral {
      background: ${CARD_COLORS.bystander};
      border: 2px solid #333333;
    }
    
    &.team-assassin {
      background: ${CARD_COLORS.assassin};
      border: 2px solid #ffff00;
      color: #ffffff;
    }
  }

  /* Animation triggers */
  &[data-animation="dealing"] {
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  &[data-animation="covering"] .cover-card {
    animation: ${dealCoverAnimation} 0.6s ease-in-out forwards;
    visibility: visible;
  }
  
  &[data-animation="dealing"] .cover-card {
    animation: ${dealCoverAnimation} 0.7s calc(var(--card-index) * 50ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }


  @media (max-width: 768px) {
    min-height: 0;
    min-width: 0;
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
    transform: ${(props) => (props.$clickable ? "translateY(-4px)" : "none")};
  }

  &:active {
    transform: ${(props) => (props.$clickable ? "translateY(1px)" : "none")};
  }

  /* When covered, just keep the hover/active states without flip */
  [data-state="covered"] &:hover {
    transform: ${(props) => (props.$clickable ? "translateY(-4px)" : "none")};
  }
`;

const PaperTexture = styled.div`
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
`;

const BaseCard = styled.button<{ $teamColor: string; $clickable: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f4f1e8;
  border: 1px solid #d4d1c8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #2a2a3e;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: clamp(0.6rem, 2vw, 1.2rem);
  z-index: 1;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: all 0.2s ease;
  transform-style: preserve-3d;
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
  outline: none;
  
  /* Spymaster colored states */
  &.spymaster-red {
    background: #b85555;
    border: 2px solid #660000;
  }
  
  &.spymaster-blue {
    background: #5588b8;
    border: 2px solid #002244;
  }
  
  &.spymaster-neutral {
    background: #999088;
    border: 2px solid #333333;
  }
  
  &.spymaster-assassin {
    background: #0a0a0a;
    border: 2px solid #ffff00;
    color: #ffffff;
  }
  
  &:hover {
    transform: ${(props) => (props.$clickable ? "translateY(-4px) scale(1.02)" : "none")};
  }
  
  @media (max-width: 768px) {
    font-size: clamp(0.6rem, 3vw, 1rem);
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.5rem, 2.5vw, 0.9rem);
  }
`;


const CoverCard = styled.div<{ $teamColor: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform: translate(8px, -8px) rotate(3deg) translateZ(10px);
  transform-style: preserve-3d;
  background-color: ${(props) => props.$teamColor};
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
  pointer-events: none;
  visibility: hidden;
  
  &.visible {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }
  
  &.red {
    background: #b85555;
    border: 2px solid #660000;
  }
  
  &.blue {
    background: #5588b8;
    border: 2px solid #002244;
  }
  
  &.neutral {
    background: #999088;
    border: 2px solid #333333;
  }
  
  &.assassin {
    background: #0a0a0a;
    border: 2px solid #ffff00;
  }
`;

const WordText = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  z-index: 1;
  position: relative;
  text-shadow:
    0.5px 0.5px 0px rgba(255, 255, 255, 0.15),
    -0.5px -0.5px 0.5px rgba(0, 0, 0, 0.4);
  filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
    drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));
  
  &::after {
    content: "";
    position: absolute;
    bottom: -0.1rem;
    left: 0;
    right: 0;
    height: 3px;
    background: currentColor;
    clip-path: polygon(0 50%, 50% 0, 100% 50%, 50% 100%);
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
      drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 768px) {
    font-size: clamp(0.6rem, 3vw, 1rem);
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.5rem, 2.5vw, 0.9rem);
  }
`;

const SpymasterSymbol = styled.div<{ $visible: boolean; $danger?: boolean }>`
  position: absolute;
  bottom: 1.5rem;
  font-size: 4rem;
  font-weight: 900;
  opacity: 0;
  z-index: 2;
  transform: scale(0) rotate(-180deg);
  color: ${(props) => props.$danger ? '#ffff00' : 'rgba(0, 0, 0, 0.4)'};
  pointer-events: none;
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.2),
    -1px -1px 1px rgba(0, 0, 0, 0.6);
  filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
    drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4));
  
  ${(props) => props.$danger && css`
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
  `}
  
  ${(props) => props.$visible && css`
    animation: stampReveal 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  `}
  
  @keyframes stampReveal {
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
  }
`;

const CoverSymbol = styled.div<{ $assassin?: boolean }>`
  font-size: 4rem;
  font-weight: 900;
  color: ${(props) => props.$assassin ? '#ffff00' : 'rgba(0, 0, 0, 0.4)'};
  pointer-events: none;
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.2),
    -1px -1px 1px rgba(0, 0, 0, 0.6);
  z-index: 2;
  filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
    drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4));
  
  ${(props) => props.$assassin && css`
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    animation: electricFlicker 2s ease-in-out infinite;
    
    @keyframes electricFlicker {
      0%, 100% { opacity: 0.6; filter: brightness(0.8); }
      10% { opacity: 1; filter: brightness(1.5); }
      20% { opacity: 0.7; filter: brightness(0.9); }
      30% { opacity: 1; filter: brightness(1.3); }
      50% { opacity: 1; filter: brightness(1.2); }
      70% { opacity: 0.8; filter: brightness(1); }
      90% { opacity: 1; filter: brightness(1.4); }
    }
  `}
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

    const getTeamClass = (card: Card) => {
      if (card.cardType === "ASSASSIN") return "assassin";
      if (card.cardType === "BYSTANDER") return "neutral";
      const team = card.teamName?.toLowerCase();
      if (team?.includes("red")) return "red";
      if (team?.includes("blue")) return "blue";
      return "neutral";
    };

    const getSpymasterClass = (card: Card) => {
      if (card.cardType === "ASSASSIN") return "spymaster-assassin";
      if (card.cardType === "BYSTANDER") return "spymaster-neutral";
      const team = card.teamName?.toLowerCase();
      if (team?.includes("red")) return "spymaster-red";
      if (team?.includes("blue")) return "spymaster-blue";
      return "spymaster-neutral";
    };

    return (
      <CardContainer
        data-state={visibility.state}
        data-animation={visibility.animation}
        style={{ "--card-index": index, "--team-color": teamColor } as React.CSSProperties}
        onAnimationEnd={handleAnimationEnd}
      >
        <CardInner className="card-inner" $clickable={clickable && !card.selected}>
          <BaseCard
            $teamColor={teamColor}
            $clickable={clickable && !card.selected}
            onClick={handleClick}
            disabled={!clickable || card.selected}
            aria-label={`Card: ${card.word}`}
            className={visibility.state === 'visible-colored' ? getSpymasterClass(card) : ''}
          >
            <PaperTexture />
            <WordText>{card.word}</WordText>
            <SpymasterSymbol 
              $visible={visibility.state === 'visible-colored'}
              $danger={card.cardType === "ASSASSIN"}
            >
              {getIcon(teamColor)}
            </SpymasterSymbol>
          </BaseCard>
          <CoverCard 
            $teamColor={teamColor} 
            className={`${getTeamClass(card)} ${visibility.state === 'covered' ? 'visible' : ''}`}
          >
            <PaperTexture />
            <CoverSymbol $assassin={card.cardType === "ASSASSIN"}>
              {getIcon(teamColor)}
            </CoverSymbol>
          </CoverCard>
        </CardInner>
      </CardContainer>
    );
  },
);

GameCard.displayName = "GameCard";
