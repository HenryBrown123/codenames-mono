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

const teamPulse = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 0 2px var(--team-color),
      0 0 15px var(--team-color),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }
  50% {
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

const assassinElectricSweep = keyframes`
  0% {
    background-position: -100% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

const dangerPulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    text-shadow: 
      0 0 20px #ffff00,
      0 0 40px #ffff00,
      0 0 60px #ff0000;
  }
  50% {
    opacity: 1;
    text-shadow: 
      0 0 30px #ffff00,
      0 0 60px #ffff00,
      0 0 80px #ff0000;
  }
`;

// ===== ANIMATION MAP =====
const animationMap = css`
  &[data-animation="deal-in"] {
    opacity: 0;
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  &[data-animation="cover-card"] {
    z-index: ${Z_INDEX.CARD_ANIMATING};

    .cover-card {
      animation: ${coverAnimation} 0.5s ease-out forwards;
    }
  }

  &[data-animation="spymaster-reveal-in"] .spymaster-overlay {
    animation: ${spymasterRevealAnimation} 0.6s ease-in forwards;
  }

  &[data-animation="spymaster-reveal-out"] .spymaster-overlay {
    animation: ${spymasterRevealAnimation} 0.6s ease-in reverse forwards;
  }
`;

// ===== CONTAINER =====
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

  ${animationMap}

  &[data-team="red"] {
    --team-color: #ff0040; /* Bright hacker red */
    --team-symbol: "★";
  }
  &[data-team="blue"] {
    --team-color: #00d4ff; /* Bright hacker blue */
    --team-symbol: "♦";
  }
  &[data-team="assassin"] {
    --team-color: #ffff00; /* Electric yellow */
    --team-symbol: "☠";
  }
  &[data-team="neutral"] {
    --team-color: #888888;
    --team-symbol: "●";
  }
  &[data-team="green"] {
    --team-color: #00ff88; /* Hacker green */
    --team-symbol: "🌿";
  }

  /* Hide base card text when spymaster overlay is visible */
  &:has(.spymaster-overlay) .normal-card .card-word {
    opacity: 0;
  }
`;

// ===== NORMAL CARD =====
export const NormalCard = styled.div<{ $isCurrentTeam?: boolean }>`
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
  transition:
    transform 0.2s,
    box-shadow 0.3s;
  color: #2a2a3e;
  font-family: sans-serif;
  font-size: clamp(1rem, 3vw, 1.4rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 0.5rem;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;

  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.3);

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
      );
    background-size:
      150px 150px,
      4px 4px;
    opacity: 0.6;
    border-radius: 6px;
    pointer-events: none;
    z-index: 1;
  }

  /* Ripple effect container */
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
    z-index: 5;
  }

  &:active .ripple {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
    animation: ${rippleEffect} 0.6s ease-out;
  }

  @media (min-width: 481px) {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    padding: 0.75rem;
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    font-size: 1.4rem;
    padding: 1rem;

    [data-clickable="true"] &:hover {
      transform: translateY(-4px);
    }
  }
`;

// ===== COVER CARD =====
export const CoverCard = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--team-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.CARD_COVERED};

  border: 2px solid var(--team-color);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 5px rgba(0, 0, 0, 0.3);

  /* Special assassin styling with electric yellow */
  ${CardContainer}[data-team="assassin"] & {
    background: #0a0a0a;
    border: 3px solid #ffff00;
    box-shadow:
      0 0 30px rgba(255, 255, 0, 0.8),
      0 0 60px rgba(255, 255, 0, 0.4),
      inset 0 0 30px rgba(255, 255, 0, 0.1);
    position: relative;
    overflow: hidden;

    /* Electric sweep effect */
    &::before {
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
      animation: ${assassinElectricSweep} 3s linear infinite;
      opacity: 0.6;
      z-index: 0;
    }
  }

  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

// ===== SPYMASTER OVERLAY =====
export const SpymasterOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};
  border-radius: 6px;
  overflow: visible; /* Changed from hidden to visible */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

export const TeamColorFilter = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--team-color) 95%, black),
    color-mix(in srgb, var(--team-color) 85%, black)
  );
  opacity: 0.9;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
  border: 3px solid var(--team-color);
  border-radius: 6px;

  /* Special assassin gradient */
  ${CardContainer}[data-team="assassin"] & {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%);
    opacity: 0.95;
    border-color: #ffff00;
    box-shadow:
      inset 0 0 40px rgba(255, 255, 0, 0.2),
      0 0 30px #ffff00;
  }

  @media (min-width: 481px) {
    border-radius: 8px;
  }

  @media (min-width: 769px) {
    border-radius: 12px;
  }
`;

export const ScanGrid = styled.div`
  position: absolute;
  inset: 4px;
  background-image:
    repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.15) 10px),
    repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.15) 10px);
  border-radius: 4px;
  opacity: 0.8;
  animation: ${gridPulse} 2s ease-in-out infinite;

  /* Assassin gets yellow scan grid */
  ${CardContainer}[data-team="assassin"] & {
    background-image:
      repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(255, 255, 0, 0.2) 10px),
      repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(255, 255, 0, 0.2) 10px);
  }
`;

export const TeamBadge = styled.div`
  /* Mobile-first: hidden on mobile */
  display: none;

  /* Progressive enhancement: show on larger screens */
  @media (min-width: 481px) {
    display: block;
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid var(--team-color);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--team-color);
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

  /* Assassin badge styling */
  ${CardContainer}[data-team="assassin"] & {
    background: #ffff00;
    color: #000;
    border-color: #ff0000;
    animation: ${electricFlicker} 2s ease-in-out infinite;
    box-shadow:
      0 0 20px #ffff00,
      0 0 40px #ff0000;
  }
`;

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

export const TargetingCorners = styled.div`
  position: absolute;
  inset: -5px;
  pointer-events: none;
  z-index: 15;

  /* Corner brackets - L-shaped corners */
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

  /* Top left corner - using border-left and border-top */
  &::before {
    top: 0;
    left: 0;
    border-left: 3px solid #00ff88;
    border-top: 3px solid #00ff88;
  }

  /* Top right corner - using border-right and border-top */
  &::after {
    top: 0;
    right: 0;
    border-right: 3px solid #00ff88;
    border-top: 3px solid #00ff88;
  }

  /* Bottom left corner - using border-left and border-bottom */
  & > span::before {
    bottom: 0;
    left: 0;
    border-left: 3px solid #00ff88;
    border-bottom: 3px solid #00ff88;
  }

  /* Bottom right corner - using border-right and border-bottom */
  & > span::after {
    bottom: 0;
    right: 0;
    border-right: 3px solid #00ff88;
    border-bottom: 3px solid #00ff88;
  }

  /* Show for current team in spymaster view */
  ${CardContainer}[data-current-team="true"] .spymaster-overlay & {
    &::before,
    &::after,
    & > span::before,
    & > span::after {
      opacity: 1;
      filter: drop-shadow(0 0 10px #00ff88) drop-shadow(0 0 20px #00ff88);
    }
  }

  @media (min-width: 481px) {
    inset: -8px;

    &::before,
    &::after,
    & > span::before,
    & > span::after {
      width: 25px;
      height: 25px;
    }
  }

  @media (min-width: 769px) {
    inset: -10px;

    &::before,
    &::after,
    & > span::before,
    & > span::after {
      width: 30px;
      height: 30px;
      border-width: 4px;
    }
  }
`;

export const SpymasterSymbol = styled.div`
  position: absolute;
  font-size: 6rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.15);
  z-index: 2;
  text-shadow:
    0 0 20px var(--team-color),
    0 0 40px var(--team-color);
  filter: drop-shadow(0 0 10px var(--team-color));
  pointer-events: none;

  &::before {
    content: var(--team-symbol);
  }

  /* Electric yellow assassin symbol in overlay */
  ${CardContainer}[data-team="assassin"] & {
    color: rgba(255, 255, 0, 0.3);
    text-shadow:
      0 0 30px #ffff00,
      0 0 60px #ffff00,
      0 0 90px #ff0000;
    filter: drop-shadow(0 0 30px #ffff00);
    animation: ${dangerPulse} 1s ease-in-out infinite;
  }

  @media (min-width: 481px) {
    font-size: 7rem;
  }

  @media (min-width: 769px) {
    font-size: 8rem;
  }
`;

export const CardARCorners = styled.div`
  position: absolute;
  inset: -3px;
  pointer-events: none;
  z-index: 20;
  opacity: 1;
  transition: opacity 0.3s ease;

  @media (min-width: 481px) {
    inset: -4px;
  }

  @media (min-width: 769px) {
    inset: -5px;
  }
`;

export const CardARCorner = styled.div<{
  $position: "tl" | "tr" | "bl" | "br";
  $isCurrentTeam?: boolean;
}>`
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #00ff88;
  filter: drop-shadow(0 0 10px #00ff88) drop-shadow(0 0 20px #00ff88);

  ${(props) => {
    switch (props.$position) {
      case "tl":
        return `
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        `;
      case "tr":
        return `
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        `;
      case "bl":
        return `
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        `;
      case "br":
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
export const CardWord = styled.span`
  position: relative;
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
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: opacity 0.3s ease;
  color: #0d0d13;

  /* Base card text */
  &.card-word {
    color: #2a2a3e; /* Dark text for readability on beige */
    text-shadow:
      1px 1px 0px rgba(255, 255, 255, 0.3),
      -1px -1px 1px rgba(0, 0, 0, 0.2);
  }

  /* Glowing text in spymaster overlay - properly centered */
  .spymaster-overlay & {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: clamp(1.2rem, 3.5vw, 1.6rem);
    text-shadow:
      0 0 10px rgba(0, 255, 136, 0.8),
      0 0 20px rgba(0, 255, 136, 0.6),
      0 0 30px rgba(0, 255, 136, 0.4);
    z-index: 5;
  }

  /* Special assassin text styling */
  ${CardContainer}[data-team="assassin"] .spymaster-overlay & {
    color: #ffff00;
    animation: ${dangerPulse} 1.5s ease-in-out infinite;
  }

  @media (min-width: 769px) {
    padding: 0 1rem;
  }
`;

export const TeamSymbol = styled.div`
  position: absolute;
  font-size: 3rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.3);
  z-index: 1;
  text-shadow:
    1px 1px 0px rgba(255, 255, 255, 0.3),
    -1px -1px 1px rgba(0, 0, 0, 0.8);
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));

  &::before {
    content: var(--team-symbol);
  }

  /* Electric yellow assassin symbol */
  ${CardContainer}[data-team="assassin"] & {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(255, 255, 0, 0.6),
      0 0 60px rgba(255, 0, 0, 0.4);
    filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.8));
    animation: ${electricFlicker} 2s ease-in-out infinite;
    z-index: 2;
  }

  @media (min-width: 481px) {
    font-size: 3.5rem;
  }

  @media (min-width: 769px) {
    font-size: 4rem;
  }
`;
