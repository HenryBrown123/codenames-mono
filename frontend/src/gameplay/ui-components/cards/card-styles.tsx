import styled, { keyframes, css } from "styled-components";

// ===== ANIMATIONS =====
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
    transform: translateX(-100vw) translateY(-100vh) rotate(-180deg);
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0);
  }
`;

const colorRevealAnimation = keyframes`
  0% {
    background-color: #f4f1e8;
  }
  100% {
    background-color: var(--team-color);
    color: white;
  }
`;

const colorFadeOutAnimation = keyframes`
  from {
    /* Animation will start from current computed styles */
  }
  to {
    background-color: #f4f1e8;
    color: #2a2a3e;
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

// ===== CONTAINER =====
export const CardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  perspective: 1000px;
  margin: auto;
  z-index: 1;
  aspect-ratio: 2.4 / 3;
  padding: 10% 0;

  /* Base state - hidden until animated in */
  opacity: 0;

  /* Team color variables */
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

  /* State-based visibility */
  &[data-state="visible"],
  &[data-state="visible-colored"],
  &[data-state="visible-covered"] {
    opacity: 1;
  }

  /* Raise z-index when animating or covered */
  &[data-state="visible-covered"],
  &[data-animation="cover-card"] {
    z-index: 10;
  }

  /* Animation triggers */
  &[data-animation="deal-in"] {
    animation: ${dealAnimation} 0.7s calc(var(--card-index) * 75ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;

// ===== BASE CARD =====
export const BaseCard = styled.div`
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
  cursor: pointer;
  transition: transform 0.2s;
  outline: none;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  will-change: transform;

  /* Default beige background */
  background: #f4f1e8;

  /* Simplified mobile shadow */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.2),
    0 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 0 rgba(0, 0, 0, 0.2),
    0 5px 10px rgba(0, 0, 0, 0.3);

  /* Clickable state */
  [data-clickable="true"] & {
    cursor: pointer;

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

  /* Paper texture effect */
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

  /* Spymaster reveal animations */
  ${CardContainer}[data-animation="spymaster-reveal-in"] > & {
    animation: ${colorRevealAnimation} 0.8s ease-in-out forwards;
  }

  ${CardContainer}[data-animation="spymaster-reveal-out"] > & {
    animation: ${colorFadeOutAnimation} 0.8s ease-in-out forwards;
  }

  /* Spymaster view colors with bright backgrounds */
  ${CardContainer}[data-state="visible-colored"][data-team="red"] > & {
    background-color: rgba(255, 51, 51, 0.9);
    color: #ffffff;
    border: 3px solid #ff0000;
    box-shadow:
      0 0 25px rgba(255, 51, 51, 0.8),
      0 0 50px rgba(255, 51, 51, 0.4),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-colored"][data-team="blue"] > & {
    background-color: rgba(51, 153, 255, 0.9);
    color: #ffffff;
    border: 3px solid #0066ff;
    box-shadow:
      0 0 25px rgba(51, 153, 255, 0.8),
      0 0 50px rgba(51, 153, 255, 0.4),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-colored"][data-team="assassin"] > & {
    background-color: rgba(10, 10, 10, 0.95);
    color: #ffffff;
    border: 3px solid #ffff00;
    box-shadow:
      0 0 30px rgba(255, 255, 0, 0.8),
      0 0 60px rgba(255, 255, 0, 0.4),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-colored"][data-team="neutral"] > & {
    background-color: rgba(139, 139, 139, 0.9);
    color: #ffffff;
    border: 3px solid #666666;
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-colored"][data-team="green"] > & {
    background-color: rgba(51, 204, 51, 0.9);
    color: #ffffff;
    border: 3px solid #00cc00;
    box-shadow:
      0 0 25px rgba(51, 204, 51, 0.8),
      0 0 50px rgba(51, 204, 51, 0.4),
      0 1px 0 rgba(0, 0, 0, 0.2),
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 3px 0 rgba(0, 0, 0, 0.2),
      0 4px 0 rgba(0, 0, 0, 0.2),
      0 5px 10px rgba(0, 0, 0, 0.3);
  }

  /* Progressive enhancement for larger screens */
  @media (min-width: 481px) {
    min-height: 70px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    padding: 0.25rem;
    border-radius: 8px;

    /* Enhanced shadow for tablets */
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

    [data-clickable="true"] &:hover {
      transform: translateY(-4px);
    }
  }

  @media (min-width: 1025px) {
    font-size: 1.2rem;
    min-height: 100px;
  }
`;

// ===== OVERLAY (Cover Card) =====
export const CardOverlay = styled.div`
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
  transform-style: preserve-3d;
  z-index: 2;
  opacity: 0;
  pointer-events: none;

  /* Simplified mobile shadow */
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.25),
    0 3px 5px rgba(0, 0, 0, 0.3);

  /* Team-specific styles */
  ${CardContainer}[data-team="red"] > & {
    background-color: #ff3333;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  ${CardContainer}[data-team="blue"] > & {
    background-color: #3399ff;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  ${CardContainer}[data-team="assassin"] > & {
    background-color: #0a0a0a;
    border: 2px solid #ffff00;
  }

  ${CardContainer}[data-team="neutral"] > & {
    background-color: #8b8b8b;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  ${CardContainer}[data-team="green"] > & {
    background-color: #33cc33;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* Electric border effect for assassin cards */
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
    background-position: -100% 50%;
    border-radius: 6px;
    opacity: 0;
    z-index: -1;
  }

  /* Team symbol */
  &::after {
    content: var(--team-symbol);
    font-size: 3rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.6);
    text-shadow:
      1px 1px 0px rgba(255, 255, 255, 0.3),
      -1px -1px 1px rgba(0, 0, 0, 0.8);
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));
  }

  ${CardContainer}[data-team="assassin"] > &::after {
    color: #ffff00;
    text-shadow:
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.6);
    filter: drop-shadow(0 0 12px rgba(255, 255, 0, 0.8));
    animation: ${electricFlicker} 2s ease-in-out infinite;
  }

  /* Covering animation */
  ${CardContainer}[data-animation="cover-card"] > & {
    animation: ${coverDealAnimation} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    opacity: 1;
  }

  /* Trigger electric sweep for assassin when covering */
  ${CardContainer}[data-animation="cover-card"][data-team="assassin"] > &::before {
    animation: ${assassinSweep} 0.8s linear 0.7s forwards;
    opacity: 1;
  }

  /* Covered state */
  ${CardContainer}[data-state="visible-covered"] > & {
    opacity: 1 !important;
    pointer-events: all;
  }

  /* Enhanced styling for covered state */
  ${CardContainer}[data-state="visible-covered"][data-team="red"] > & {
    border: 2px solid #ff6666;
    box-shadow:
      0 0 25px rgba(255, 51, 51, 0.7),
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 5px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-covered"][data-team="blue"] > & {
    border: 2px solid #66b3ff;
    box-shadow:
      0 0 25px rgba(51, 153, 255, 0.7),
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 5px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-covered"][data-team="assassin"] > & {
    border: 3px solid #ffff00;
    box-shadow:
      0 0 25px rgba(255, 255, 0, 0.8),
      0 0 50px rgba(255, 255, 0, 0.4),
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 5px rgba(0, 0, 0, 0.3);
  }

  ${CardContainer}[data-state="visible-covered"][data-team="neutral"] > & {
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 5px rgba(0, 0, 0, 0.3);
  }

  /* Progressive enhancement for larger screens */
  @media (min-width: 481px) {
    border-radius: 8px;

    /* Enhanced shadow */
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.25),
      0 3px 0 rgba(0, 0, 0, 0.25),
      0 4px 0 rgba(0, 0, 0, 0.25),
      0 5px 10px rgba(0, 0, 0, 0.4);

    &::after {
      font-size: 4rem;
      color: rgba(0, 0, 0, 0.7);
    }
  }

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

    &::after {
      font-size: 6rem;
      color: rgba(0, 0, 0, 0.8);
      filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.1))
        drop-shadow(-1px -1px 1px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
    }
  }
`;

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

  /* Progressive enhancement for desktop text effects */
  @media (min-width: 769px) {
    padding: 0 1rem;
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(255, 255, 255, 0.05))
      drop-shadow(-0.5px -0.5px 0.5px rgba(0, 0, 0, 0.2));
  }
`;
