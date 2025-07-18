import styled, { css, keyframes } from "styled-components";
import { Z_INDEX } from "@frontend/style/z-index";
import { CARD_ANIMATION, CARD_DIMENSIONS, CARD_TYPOGRAPHY } from "./card-constants";

// ===== ANIMATIONS =====
/**
 * Card dealing animation - cards fly in from top-left corner with rotation
 * Creates a satisfying "dealing from deck" effect
 */
const dealAnimation = keyframes`
  0% {
    transform: translateX(-100vw) translateY(-100vh) rotate(-6deg);
    opacity: 0;
  }
  60% {
    /* Slight overshoot for bounce effect */
    transform: translateX(0) translateY(0) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0);
    opacity: 1;
  }
`;

/**
 * Cover card animation - slides down from above to cover the base card
 * Used when a card is guessed/selected
 */
const coverAnimation = keyframes`
  from { 
    transform: translateY(-100%);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Spymaster reveal animation - subtle scale and fade for AR overlay appearance
 */
const spymasterRevealAnimation = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Team color pulse - creates a "breathing" glow effect for current team cards
 * Used in spymaster view to highlight which cards belong to active team
 */
const teamPulse = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 0 2px var(--team-color),
      0 0 15px var(--team-color),
      /* Stacked shadows for paper depth effect */
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }
  50% {
    /* Expand the glow at peak */
    box-shadow: 
      0 0 0 3px var(--team-color),
      0 0 25px var(--team-color),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }
`;

/**
 * Assassin card dramatic reveal - electric flash then steady danger glow
 * Only plays once (forwards) to avoid battery drain
 */
const assassinReveal = keyframes`
  /* Initial state - dim and subtle */
  0% {
    opacity: 0.6;
    filter: brightness(0.8);
    box-shadow: 0 0 20px rgba(255, 255, 0, 0);
  }
  
  /* Dramatic flash moment */
  10% {
    opacity: 1;
    filter: brightness(1.8);
    box-shadow: 0 0 40px rgba(255, 255, 0, 0.8);
  }
  
  /* Settle to steady danger state */
  20%, 100% {
    opacity: 0.9;
    filter: brightness(1.1);
    box-shadow: 0 0 25px rgba(255, 255, 0, 0.5);
  }
`;

/**
 * Scan grid pulse - subtle opacity animation for AR grid overlay
 * Creates "scanning" effect in spymaster view
 */
const gridPulse = keyframes`
  0%, 100% { 
    opacity: 0.3; 
  }
  50% { 
    opacity: 0.6; 
  }
`;

/**
 * Click ripple effect - Material Design inspired touch feedback
 */
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

/**
 * Assassin electric sweep - creates moving "electricity" effect on border
 * Simulates dangerous high-voltage appearance
 */
const assassinElectricSweep = keyframes`
  0% {
    background-position: -100% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

/**
 * Danger pulse for assassin text - warning strobe effect
 */
const dangerPulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    text-shadow: 
      0 0 20px #ffff00,
      0 0 40px #ffff00,
      0 0 60px #ff0000; /* Red outer glow for danger */
  }
  50% {
    opacity: 1;
    text-shadow: 
      0 0 30px #ffff00,
      0 0 60px #ffff00,
      0 0 80px #ff0000;
  }
`;

/**
 * AR targeting corners blink animation - creates "lock on" effect
 * Different timing on each corner creates organic feel
 */
const cornerBlink = keyframes`
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 15px #00ff88) drop-shadow(0 0 30px #00ff88);
    border-color: #00ff88;
  }
  25% {
    opacity: 0.2;
    filter: drop-shadow(0 0 5px #00ff88) drop-shadow(0 0 10px #00ff88);
    border-color: rgba(0, 255, 136, 0.5);
  }
  50% {
    opacity: 0.8;
    filter: drop-shadow(0 0 12px #00ff88) drop-shadow(0 0 25px #00ff88);
    border-color: #00ff88;
  }
  75% {
    opacity: 0.1;
    filter: drop-shadow(0 0 3px #00ff88) drop-shadow(0 0 8px #00ff88);
    border-color: rgba(0, 255, 136, 0.3);
  }
`;

// ===== ANIMATION MAP =====
/**
 * Central animation controller based on data-animation attribute
 * Supports reduced motion preferences for accessibility
 */
const animationMap = css`
  /* Only animate if user hasn't requested reduced motion */
  @media (prefers-reduced-motion: no-preference) {
    /* Card dealing animation with staggered delay based on index */
    &[data-animation="deal-in"] {
      opacity: 0;
      animation: ${dealAnimation} ${CARD_ANIMATION.DEAL_DURATION}ms
        calc(var(--card-index) * ${CARD_ANIMATION.DEAL_STAGGER}ms)
        cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    /* Cover animation when card is selected */
    &[data-animation="cover-card"] {
      /* Raise z-index during animation to prevent overlap issues */
      z-index: ${Z_INDEX.CARD_ANIMATING};

      .cover-card {
        animation: ${coverAnimation} ${CARD_ANIMATION.COVER_DURATION}ms ease-out forwards;
      }
    }

    /* Spymaster AR overlay animations */
    &[data-animation="spymaster-reveal-in"] .spymaster-overlay {
      animation: ${spymasterRevealAnimation} ${CARD_ANIMATION.REVEAL_DURATION}ms ease-in forwards;
    }

    &[data-animation="spymaster-reveal-out"] .spymaster-overlay {
      animation: ${spymasterRevealAnimation} ${CARD_ANIMATION.REVEAL_DURATION}ms ease-in reverse
        forwards;
    }
  }

  /* Reduced motion fallbacks - instant transitions instead of animations */
  @media (prefers-reduced-motion: reduce) {
    &[data-animation="deal-in"] {
      opacity: 1;
      transform: none;
      transition: opacity 0.3s ease;
    }

    &[data-animation="cover-card"] {
      z-index: ${Z_INDEX.CARD_ANIMATING};

      .cover-card {
        opacity: 1;
        transform: none;
        transition: opacity 0.3s ease;
      }
    }

    &[data-animation="spymaster-reveal-in"] .spymaster-overlay {
      opacity: 1;
      transform: none;
      transition: opacity 0.3s ease;
    }

    &[data-animation="spymaster-reveal-out"] .spymaster-overlay {
      opacity: 0;
      transform: none;
      transition: opacity 0.3s ease;
    }
  }
`;

// ===== CONTAINER =====
/**
 * Main card container - handles layout, animations, and team color variables
 * Uses CSS custom properties for dynamic theming based on team
 */
export const CardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  /* 3D perspective for card flip effects (not currently used but available) */
  perspective: 1000px;

  /* Base z-index, will be modified during animations */
  z-index: ${Z_INDEX.BASE};

  /* Maintain card aspect ratio */
  aspect-ratio: ${CARD_DIMENSIONS.ASPECT_RATIO};

  /* Padding creates space for shadow/glow effects */
  padding: 10% 0;
  margin: auto;

  /* Performance optimization - isolates rendering but allows overflow for AR corners */
  contain: layout style;
  overflow: visible;

  /* Only hint browser about animations when needed */
  &[data-will-animate="true"] {
    will-change: transform;
  }

  /* Clean up performance hints after animation */
  &[data-animation=""] {
    will-change: auto;
  }

  /* Apply animation map based on data-animation attribute */
  ${animationMap}

  /* Team color CSS variables - used throughout child components */
  &[data-team="red"] {
    --team-color: #ff0040; /* Bright hacker red */
  }
  &[data-team="blue"] {
    --team-color: #00d4ff; /* Bright hacker blue */
  }
  &[data-team="assassin"] {
    --team-color: #ffff00; /* Electric yellow for danger */
  }
  &[data-team="neutral"] {
    --team-color: #888888;
  }
  &[data-team="green"] {
    --team-color: #00ff88; /* Hacker terminal green */
  }

  /* Hide base card text when spymaster overlay is active to prevent overlap */
  &:has(.spymaster-overlay) .normal-card .card-word {
    opacity: 0;
  }
`;

// ===== NORMAL CARD =====
/**
 * Base card appearance - beige paper with texture
 * This is what players see before cards are revealed
 */
export const NormalCard = styled.div<{ $isCurrentTeam?: boolean }>`
  position: absolute;
  inset: 0; /* Shorthand for top/right/bottom/left: 0 */

  /* Aged paper gradient */
  background: linear-gradient(
    to bottom,
    #f4f1e8 0%,
    /* Light beige */ #ebe7dc 100% /* Darker beige for depth */
  );

  border: 1px solid #d4d1c8; /* Slightly darker than background */
  border-radius: ${CARD_DIMENSIONS.BORDER_RADIUS.MOBILE}px;

  /* Center the word */
  display: flex;
  align-items: center;
  justify-content: center;

  z-index: ${Z_INDEX.CARD_BASE};
  cursor: pointer;

  /* Smooth transitions for hover effects */
  transition:
    transform ${CARD_ANIMATION.HOVER_DURATION}ms,
    box-shadow 0.3s;

  /* Typography */
  color: #2a2a3e; /* Dark blue-gray for contrast */
  font-family: sans-serif;
  font-size: ${CARD_TYPOGRAPHY.FONT_SIZE.MOBILE};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: ${CARD_TYPOGRAPHY.LETTER_SPACING.MOBILE};
  padding: 0.5rem;

  /* Clip pseudo-elements but not AR corners */
  overflow: hidden;

  /* Force GPU acceleration for smooth animations */
  transform: translateZ(0);

  min-height: ${CARD_DIMENSIONS.MOBILE_MIN_HEIGHT}px;

  /* Single performant shadow instead of stacked shadows */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  /* Edge highlight gradient - creates subtle 3D effect */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      /* Bright corner */ transparent 50% /* Fade out */
    );
    pointer-events: none;
  }

  /* Hover effects only for precise pointers (mouse, not touch) */
  @media (hover: hover) and (pointer: fine) {
    [data-clickable="true"] & {
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      }
    }
  }

  /* Touch feedback - scale instead of translate to avoid sticky hover */
  [data-clickable="true"] & {
    &:active {
      transform: scale(0.98);
    }
  }

  /* Non-clickable cards don't respond to interaction */
  [data-clickable="false"] & {
    cursor: default;
    &:hover {
      transform: none;
    }
  }

  /* Paper texture overlay - creates realistic paper feel */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    /* SVG noise filter for paper texture */
    background:
      url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="6" /%3E%3CfeColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.85 0 0 0 0.15 0"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)"/%3E%3C/svg%3E'),
      /* Subtle lines for paper grain */
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.04) 2px,
          rgba(0, 0, 0, 0.04) 3px
        );
    background-size:
      150px 150px,
      4px 4px;
    opacity: 0.6;
    border-radius: inherit;
    pointer-events: none;
    /* Relative z-index to stay above base but below text */
    z-index: ${Z_INDEX.CARD_TEXTURE - Z_INDEX.CARD_BASE};
  }

  /* Ripple effect container for click feedback */
  .ripple {
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
    z-index: ${Z_INDEX.CARD_RIPPLE};
  }

  /* Trigger ripple on click */
  &:active .ripple {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
    animation: ${rippleEffect} 0.6s ease-out;
  }

  /* Responsive sizing for larger screens */
  @media (min-width: 481px) {
    min-height: ${CARD_DIMENSIONS.TABLET_MIN_HEIGHT}px;
    border-radius: ${CARD_DIMENSIONS.BORDER_RADIUS.TABLET}px;
    font-size: ${CARD_TYPOGRAPHY.FONT_SIZE.TABLET};
    letter-spacing: ${CARD_TYPOGRAPHY.LETTER_SPACING.TABLET};
    padding: 0.75rem;
  }

  @media (min-width: 769px) {
    min-height: ${CARD_DIMENSIONS.DESKTOP_MIN_HEIGHT}px;
    border-radius: ${CARD_DIMENSIONS.BORDER_RADIUS.DESKTOP}px;
    font-size: ${CARD_TYPOGRAPHY.FONT_SIZE.DESKTOP};
    letter-spacing: ${CARD_TYPOGRAPHY.LETTER_SPACING.DESKTOP};
    padding: 1rem;
  }
`;

// ===== COVER CARD =====
/**
 * Overlay that appears when a card is guessed/selected
 * Shows team color and symbol
 */
export const CoverCard = styled.div`
  position: absolute;
  inset: 0;

  /* Team color from CSS variable */
  background-color: var(--team-color);
  border-radius: 6px;

  /* Center the team symbol */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Above normal card but below modals */
  z-index: ${Z_INDEX.CARD_COVERED};

  /* Colored border matches background */
  border: 2px solid var(--team-color);

  /* Simple shadow for selected cards */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 5px rgba(0, 0, 0, 0.3);

  /* Special assassin card styling - maximum danger vibes */
  ${CardContainer}[data-team="assassin"] & {
    background: #0a0a0a; /* Near black */
    border: 3px solid #ffff00; /* Electric yellow border */
    box-shadow:
      0 0 30px rgba(255, 255, 0, 0.8),
      /* Outer glow */ 0 0 60px rgba(255, 255, 0, 0.4),
      /* Wider glow */ inset 0 0 30px rgba(255, 255, 0, 0.1); /* Inner glow */
    position: relative;
    overflow: hidden;

    /* Animated electric sweep effect on border */
    &::before {
      content: "";
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      /* Moving gradient creates "electricity" effect */
      background: linear-gradient(
        90deg,
        transparent 0%,
        transparent 30%,
        #ffff00 40%,
        /* Yellow bolt */ #00ffff 45%,
        /* Cyan accent */ #ffff00 50%,
        /* Yellow bolt */ transparent 60%,
        transparent 100%
      );
      background-size: 300% 100%;
      animation: ${assassinElectricSweep} 3s linear infinite;
      opacity: 0.6;
      z-index: 0;
    }
  }

  /* Responsive border radius */
  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

// ===== SPYMASTER OVERLAY =====
/**
 * AR mode overlay that shows team colors and targeting info
 * Only visible in spymaster view
 */
export const SpymasterOverlay = styled.div`
  position: absolute;
  inset: 0;

  /* Doesn't block clicks on cards */
  pointer-events: none;

  /* Above cards but below HUD */
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};

  border-radius: 6px;

  /* Allow AR corners to extend beyond card boundaries */
  overflow: visible;

  /* Center content */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  /* Responsive border radius */
  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

/**
 * Team color filter - creates vibrant team-colored overlay
 * Uses color-mix for consistent darkening across all team colors
 */
export const TeamColorFilter = styled.div`
  position: absolute;
  inset: 0;

  /* Gradient creates depth, color-mix ensures visibility */
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--team-color) 95%, black),
    color-mix(in srgb, var(--team-color) 85%, black)
  );

  opacity: 0.9;

  /* Inner shadow for recessed effect */
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);

  /* Bright team-colored border */
  border: 3px solid var(--team-color);
  border-radius: 6px;

  /* Special assassin gradient - ominous and dark */
  ${CardContainer}[data-team="assassin"] & {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%);
    opacity: 0.95;
    border-color: #ffff00;
    box-shadow:
      inset 0 0 40px rgba(255, 255, 0, 0.2),
      /* Inner yellow glow */ 0 0 30px #ffff00; /* Outer yellow glow */
  }

  /* Responsive border radius */
  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

/**
 * AR scan grid - creates "scanning" effect over cards
 * Green for normal teams, yellow for assassin
 */
export const ScanGrid = styled.div`
  position: absolute;
  inset: 4px; /* Slight inset from edges */

  /* Repeating gradients create grid pattern */
  background-image:
    repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.15) 10px),
    repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.15) 10px);

  border-radius: 4px;
  opacity: 0.8;

  /* Pulsing animation creates "active scan" effect */
  animation: ${gridPulse} 2s ease-in-out infinite;

  /* Assassin gets danger-yellow scan grid */
  ${CardContainer}[data-team="assassin"] & {
    background-image:
      repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(255, 255, 0, 0.2) 10px),
      repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(255, 255, 0, 0.2) 10px);
  }
`;

/**
 * Team classification badge - shows team name at bottom of card
 * Hidden on mobile for space, visible on tablets+
 */
export const TeamBadge = styled.div`
  /* Mobile-first: hidden */
  display: none;

  /* Tablet+: Show badge */
  @media (min-width: 481px) {
    display: block;
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);

    /* Dark background with team-colored border */
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid var(--team-color);
    padding: 4px 10px;
    border-radius: 12px;

    /* Small caps text */
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--team-color);

    /* Glowing effect */
    box-shadow:
      0 0 15px var(--team-color),
      inset 0 0 10px rgba(0, 0, 0, 0.5);

    font-family: "JetBrains Mono", monospace;
    z-index: 10;
  }

  @media (min-width: 769px) {
    font-size: 11px;
    padding: 5px 12px;
  }

  /* Special assassin badge - inverted colors for maximum warning */
  ${CardContainer}[data-team="assassin"] & {
    background: #ffff00; /* Bright yellow background */
    color: #000; /* Black text */
    border-color: #ff0000; /* Red border for extra danger */
    box-shadow:
      0 0 20px #ffff00,
      0 0 40px #ff0000;

    /* Dramatic reveal animation */
    @media (prefers-reduced-motion: no-preference) {
      animation: ${assassinReveal} 2s ease-out forwards;
    }

    /* Static version for accessibility */
    @media (prefers-reduced-motion: reduce) {
      opacity: 0.9;
      filter: brightness(1.1);
      box-shadow: 0 0 25px rgba(255, 255, 0, 0.5);
    }
  }
`;

// Unused component - kept for potential future use
export const SpymasterGlow = styled.div<{ $isCurrentTeam?: boolean }>`
  position: absolute;
  inset: -3px;
  border-radius: 9px;
  opacity: ${(props) => (props.$isCurrentTeam ? 1 : 0)};
  background: transparent;
  border: 3px solid var(--team-color);
  box-shadow:
    0 0 20px var(--team-color),
    0 0 40px var(--team-color),
    inset 0 0 20px var(--team-color);
  animation: ${(props) => (props.$isCurrentTeam ? teamPulse : "none")} 2s ease-in-out infinite;
  pointer-events: none;
  transition: opacity 0.3s ease;
`;

// Unused component - kept for potential future use
export const TargetingCorners = styled.div`
  position: absolute;
  inset: -5px;
  pointer-events: none;
  z-index: 15;

  /* L-shaped corner brackets using borders */
  &::before,
  &::after,
  & > span::before,
  & > span::after {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Each corner uses two borders to create L shape */
  &::before {
    top: 0;
    left: 0;
    border-left: 3px solid #00ff88;
    border-top: 3px solid #00ff88;
  }

  &::after {
    top: 0;
    right: 0;
    border-right: 3px solid #00ff88;
    border-top: 3px solid #00ff88;
  }

  & > span::before {
    bottom: 0;
    left: 0;
    border-left: 3px solid #00ff88;
    border-bottom: 3px solid #00ff88;
  }

  & > span::after {
    bottom: 0;
    right: 0;
    border-right: 3px solid #00ff88;
    border-bottom: 3px solid #00ff88;
  }
`;

/**
 * Large team symbol overlay - shows in spymaster view
 * Helps quickly identify card types at a glance
 */
export const SpymasterSymbol = styled.div`
  position: absolute;
  font-size: 6rem;
  font-weight: 900;

  /* Semi-transparent white for subtlety */
  color: rgba(255, 255, 255, 0.15);
  z-index: 2;

  /* Glowing effect using team color */
  text-shadow:
    0 0 20px var(--team-color),
    0 0 40px var(--team-color);
  filter: drop-shadow(0 0 10px var(--team-color));
  pointer-events: none;

  /* Team symbols defined by data attributes on container */
  ${CardContainer}[data-team="red"] &::before {
    content: "★";
  }
  ${CardContainer}[data-team="blue"] &::before {
    content: "♦";
  }
  ${CardContainer}[data-team="assassin"] &::before {
    content: "☠";
  }
  ${CardContainer}[data-team="neutral"] &::before {
    content: "●";
  }
  ${CardContainer}[data-team="green"] &::before {
    content: "🌿";
  }

  /* Assassin symbol - maximum visibility and danger */
  ${CardContainer}[data-team="assassin"] & {
    color: rgba(255, 255, 0, 0.3); /* Yellow tint */
    text-shadow:
      0 0 30px #ffff00,
      /* Inner yellow glow */ 0 0 60px #ffff00,
      /* Middle yellow glow */ 0 0 90px #ff0000; /* Outer red danger glow */
    filter: drop-shadow(0 0 30px #ffff00);

    /* Pulsing danger effect */
    @media (prefers-reduced-motion: no-preference) {
      animation: ${dangerPulse} 1s ease-in-out infinite;
    }

    /* Static for accessibility */
    @media (prefers-reduced-motion: reduce) {
      opacity: 1;
      text-shadow:
        0 0 30px #ffff00,
        0 0 60px #ffff00,
        0 0 80px #ff0000;
    }
  }

  /* Responsive sizing */
  @media (min-width: 481px) {
    font-size: 7rem;
  }

  @media (min-width: 769px) {
    font-size: 8rem;
  }
`;

/**
 * AR targeting corners container - wraps the four corner elements
 * Positioned slightly outside card bounds for sci-fi effect
 */
export const CardARCorners = styled.div`
  position: absolute;
  inset: -3px; /* Extend beyond card edges */
  pointer-events: none;
  z-index: 20; /* Above other overlays */
  opacity: 1;
  transition: opacity 0.3s ease;

  /* Larger extension on bigger screens */
  @media (min-width: 481px) {
    inset: -4px;
  }

  @media (min-width: 769px) {
    inset: -5px;
  }
`;

/**
 * Individual AR corner bracket - creates targeting reticle effect
 * Only visible on current team's cards in spymaster view
 */
export const CardARCorner = styled.div<{
  $position: "tl" | "tr" | "bl" | "br";
}>`
  position: absolute;
  width: 20px;
  height: 20px;

  /* L-shaped bracket using borders */
  border: 3px solid #00ff88;

  /* Hidden by default */
  opacity: 0;
  transition: opacity 0.3s ease;

  /* Show when parent card has data-current-team="true" */
  [data-current-team="true"] & {
    opacity: 1;
    border-color: #00ff88;

    /* Glowing effect with multiple shadows */
    filter: drop-shadow(0 0 15px #00ff88) drop-shadow(0 0 30px #00ff88);

    /* Animated blinking for "targeting" effect */
    @media (prefers-reduced-motion: no-preference) {
      animation: ${cornerBlink} 2s ease-in-out infinite;
    }
  }

  /* Position each corner and remove appropriate borders to create L shape */
  ${(props) => {
    switch (props.$position) {
      case "tl": // Top-left
        return `
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        `;
      case "tr": // Top-right
        return `
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        `;
      case "bl": // Bottom-left
        return `
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        `;
      case "br": // Bottom-right
        return `
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        `;
      default:
        return "";
    }
  }}

  /* Responsive sizing */
  @media (min-width: 481px) {
    width: 25px;
    height: 25px;
  }

  @media (min-width: 769px) {
    width: 30px;
    height: 30px;
    border-width: 4px;
  }
`;

// ===== SHARED COMPONENTS =====
/**
 * Card word display - handles text in both normal and AR views
 * Adapts styling based on parent context
 */
export const CardWord = styled.span`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;

  /* Handle long words */
  word-wrap: break-word;
  overflow-wrap: break-word;

  margin: 0;
  padding: 0 0.5rem;

  /* Above texture but below overlays */
  z-index: ${Z_INDEX.CARD_WORD};

  /* Typography */
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: opacity 0.3s ease;
  color: #0d0d13;

  /* Normal card text - dark for contrast on beige */
  &.card-word {
    color: #2a2a3e;
    /* Subtle embossed effect */
    text-shadow:
      1px 1px 0px rgba(255, 255, 255, 0.3),
      /* Light from top-left */ -1px -1px 1px rgba(0, 0, 0, 0.2); /* Shadow to bottom-right */
  }

  /* AR overlay text - glowing hacker style */
  .spymaster-overlay & {
    /* Re-center in overlay context */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* Larger, glowing text */
    font-size: clamp(1.2rem, 3.5vw, 1.6rem);

    /* Multi-layer glow effect */
    text-shadow:
      0 0 10px rgba(0, 255, 136, 0.8),
      /* Inner glow */ 0 0 20px rgba(0, 255, 136, 0.6),
      /* Middle glow */ 0 0 30px rgba(0, 255, 136, 0.4); /* Outer glow */

    z-index: 5;
  }

  /* Assassin card text - electric yellow danger */
  ${CardContainer}[data-team="assassin"] .spymaster-overlay & {
    color: #ffff00;

    /* Animated danger pulse */
    @media (prefers-reduced-motion: no-preference) {
      animation: ${dangerPulse} 1.5s ease-in-out infinite;
    }

    /* Static danger glow */
    @media (prefers-reduced-motion: reduce) {
      opacity: 1;
      text-shadow:
        0 0 30px #ffff00,
        0 0 60px #ffff00,
        0 0 80px #ff0000;
    }
  }

  /* More padding on desktop */
  @media (min-width: 769px) {
    padding: 0 1rem;
  }
`;

/**
 * Team symbol for covered cards - shows after card is guessed
 * Large icon indicating which team the card belonged to
 */
export const TeamSymbol = styled.div`
  position: absolute;
  font-size: 3rem;
  font-weight: 900;

  /* Dark semi-transparent for most teams */
  color: rgba(0, 0, 0, 0.3);
  z-index: 1;

  /* Embossed effect */
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.3),
    -1px -1px 1px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));

  /* Symbols defined by parent card's data-team attribute */
  ${CardContainer}[data-team="red"] &::before {
    content: "★";
  }
  ${CardContainer}[data-team="blue"] &::before {
    content: "♦";
  }
  ${CardContainer}[data-team="assassin"] &::before {
    content: "☠";
  }
  ${CardContainer}[data-team="neutral"] &::before {
    content: "●";
  }
  ${CardContainer}[data-team="green"] &::before {
    content: "🌿";
  }

  /* Assassin symbol - bright yellow with electric glow */
  ${CardContainer}[data-team="assassin"] & {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      /* Inner yellow */ 0 0 40px rgba(255, 255, 0, 0.6),
      /* Middle yellow */ 0 0 60px rgba(255, 0, 0, 0.4); /* Outer red danger */
    filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.8));
    z-index: 2; /* Above the electric sweep effect */

    /* Dramatic entrance animation */
    @media (prefers-reduced-motion: no-preference) {
      animation: ${assassinReveal} 2s ease-out forwards;
    }

    /* Static glow effect */
    @media (prefers-reduced-motion: reduce) {
      opacity: 0.9;
      filter: brightness(1.1) drop-shadow(0 0 25px rgba(255, 255, 0, 0.5));
    }
  }

  /* Responsive sizing */
  @media (min-width: 481px) {
    font-size: 3.5rem;
  }

  @media (min-width: 769px) {
    font-size: 4rem;
  }
`;
