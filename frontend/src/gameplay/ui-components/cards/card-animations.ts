import { keyframes } from "styled-components";

// ===== CARD ANIMATIONS =====

/**
 * Card dealing animation - cards fly in from top-left corner with rotation
 * Creates a satisfying "dealing from deck" effect
 */
export const dealAnimation = keyframes`
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
export const coverAnimation = keyframes`
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
export const spymasterRevealAnimation = keyframes`
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
export const teamPulse = keyframes`
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
export const assassinReveal = keyframes`
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
export const gridPulse = keyframes`
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
export const rippleEffect = keyframes`
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
export const assassinElectricSweep = keyframes`
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
export const dangerPulse = keyframes`
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
export const cornerBlink = keyframes`
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