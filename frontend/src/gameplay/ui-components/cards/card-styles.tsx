import styled, { css, keyframes } from "styled-components";
import { Z_INDEX } from "@frontend/style/z-index";

// ===== ANIMATIONS =====
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
  from { 
    transform: translateY(-100%);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
`;

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

const gridPulse = keyframes`
  0%, 100% { 
    opacity: 0.3; 
  }
  50% { 
    opacity: 0.6; 
  }
`;

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

// ===== ANIMATION MAP - ALL ANIMATION LOGIC HERE =====
const animationMap = css`
  /* Deal animation - affects whole container */
  &[data-animation="deal-in"] {
    opacity: 0;
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  /* Cover animation - brings card to front and animates cover */
  &[data-animation="cover-card"] {
    z-index: ${Z_INDEX.CARD_ANIMATING};
    
    .cover-card {
      animation: ${coverAnimation} 0.5s ease-out forwards;
    }
  }

  /* Spymaster reveal animation */
  &[data-animation="spymaster-reveal-in"] .spymaster-overlay {
    animation: ${spymasterRevealAnimation} 0.6s ease-in forwards;
  }

  &[data-animation="spymaster-reveal-out"] .spymaster-overlay {
    animation: ${spymasterRevealAnimation} 0.6s ease-in reverse forwards;
  }
`;

// ===== CONTAINER - SIMPLE =====
export const CardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  perspective: 1000px;
  z-index: ${Z_INDEX.BASE};
  aspect-ratio: 2.4 / 3;
  padding: 10% 0;
  margin: auto;

  /* All animations handled here */
  ${animationMap}

  /* Team variables for children to use */
  &[data-team="red"] {
    --team-color: #ff3333;
    --team-symbol: "★";
  }
  &[data-team="blue"] {
    --team-color: #3399ff;
    --team-symbol: "♦";
  }
  &[data-team="assassin"] {
    --team-color: #0a0a0a;
    --team-symbol: "☠";
  }
  &[data-team="neutral"] {
    --team-color: #8b8b8b;
    --team-symbol: "●";
  }
  &[data-team="green"] {
    --team-color: #33cc33;
    --team-symbol: "🌿";
  }
`;

// ===== NORMAL CARD - The beige base card everyone sees =====
export const NormalCard = styled.div`
  position: absolute;
  inset: 0;
  background: #f4f1e8;
  border: 1px solid #d4d1c8;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.CARD_BASE};
  cursor: pointer;
  transition: transform 0.2s;
  color: #2a2a3e;
  font-family: sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  
  /* Mobile shadow */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.3);

  /* Clickable states */
  [data-clickable="true"] & {
    &:hover {
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(1px);
    }
  }

  [data-clickable="false"] & {
    cursor: default;
    &:hover {
      transform: none;
    }
  }

  /* Paper texture */
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
    border-radius: 6px;
    pointer-events: none;
    z-index: 1;
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

  /* Progressive enhancement for larger screens */
  @media (min-width: 481px) {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    padding: 0.25rem;
    border-radius: 8px;

    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 0 rgba(0, 0, 0, 0.2),
      0 6px 0 rgba(0, 0, 0, 0.2),
      0 7px 15px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 769px) {
    font-size: 1rem;
    letter-spacing: 0.1em;
    padding: 0.5rem;

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

    [data-clickable="true"] &:hover {
      transform: translateY(-4px);
    }
  }

  @media (min-width: 1025px) {
    font-size: 1.2rem;
  }
`;

// ===== COVER CARD - Shows when card is selected/guessed =====
export const CoverCard = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--team-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.CARD_COVERED};
  
  /* Style based on team */
  border: 2px solid var(--team-color);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 5px rgba(0, 0, 0, 0.3);

  /* Special assassin styling */
  ${CardContainer}[data-team="assassin"] & {
    border: 3px solid #ffff00;
    box-shadow:
      0 0 30px rgba(255, 255, 0, 0.8),
      0 0 60px rgba(255, 255, 0, 0.4);
  }

  /* Progressive enhancement */
  @media (min-width: 481px) {
    border-radius: 8px;
    
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 0 rgba(0, 0, 0, 0.25),
      0 4px 0 rgba(0, 0, 0, 0.25),
      0 5px 10px rgba(0, 0, 0, 0.4);
  }

  @media (min-width: 769px) {
    border-radius: 12px;
    
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

// ===== SPYMASTER OVERLAY - All AR/spymaster visual elements =====
export const SpymasterOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};
`;

// Spymaster child: Semi-transparent team color
export const TeamColorFilter = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--team-color);
  opacity: 0.15;
  border-radius: 6px;

  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

// Spymaster child: Scan grid
export const ScanGrid = styled.div`
  position: absolute;
  inset: 4px;
  background-image: 
    repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.1) 10px),
    repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.1) 10px);
  border-radius: 4px;
  opacity: 0.8;
  animation: ${gridPulse} 2s ease-in-out infinite;

  @media (min-width: 481px) {
    border-radius: 6px;
  }

  @media (min-width: 769px) {
    border-radius: 8px;
  }
`;

// Spymaster child: Team classification badge  
export const TeamBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--team-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--team-color);
`;

// ===== SHARED: Card word (used by both NormalCard and CoverCard) =====
export const CardWord = styled.span`
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

  /* Mobile text shadow */
  text-shadow:
    0.5px 0.5px 0px rgba(255, 255, 255, 0.15),
    -0.5px -0.5px 0.5px rgba(0, 0, 0, 0.4);

  /* Progressive enhancement for desktop */
  @media (min-width: 769px) {
    padding: 0 1rem;
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
      drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));
  }
`;

// ===== SHARED: Team symbol (used by CoverCard) =====
export const TeamSymbol = styled.div`
  position: absolute;
  font-size: 4rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.4);
  z-index: 1;
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.3),
    -1px -1px 1px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));
  
  &::before {
    content: var(--team-symbol);
  }

  /* Special assassin styling */
  ${CardContainer}[data-team="assassin"] & {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    filter: drop-shadow(0 0 12px rgba(255, 255, 0, 0.8));
    animation: ${electricFlicker} 2s ease-in-out infinite;
  }

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