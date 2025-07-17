import styled, { keyframes } from "styled-components";

// ===== ANIMATIONS =====
const dealAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100vh) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
`;

const colorFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const coverFlip = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
`;

// ===== CONTAINER - Add 3D support for flip =====
export const CardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 1000px;

  /* Team color variables */
  &[data-team="red"] {
    --team-color: #ff3333;
    --team-color-transparent: #ff3333dd;
    --team-border: #ff6666;
    --team-symbol: "★";
  }

  &[data-team="blue"] {
    --team-color: #3399ff;
    --team-color-transparent: #3399ffdd;
    --team-border: #66b3ff;
    --team-symbol: "♦";
  }

  &[data-team="assassin"] {
    --team-color: #0a0a0a;
    --team-color-transparent: #0a0a0add;
    --team-border: #ffff00;
    --team-symbol: "☠";
  }

  &[data-team="neutral"] {
    --team-color: #8b8b8b;
    --team-color-transparent: #8b8b8bdd;
    --team-border: #aaaaaa;
    --team-symbol: "●";
  }

  &[data-team="green"] {
    --team-color: #33cc33;
    --team-color-transparent: #33cc33dd;
    --team-border: #66ff66;
    --team-symbol: "🌿";
  }

  /* Handle covering animation on container */
  &[data-animation="covering"] {
    animation: ${coverFlip} 0.6s ease-in-out forwards;
  }
`;

// ===== BASE CARD - Updated with animations =====
export const BaseCard = styled.div`
  /* Layout - unchanged */
  width: 100%;
  height: 100%;
  aspect-ratio: 2.4 / 3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  cursor: default;
  backface-visibility: hidden;
  transform: rotateY(0deg);
  z-index: 2;

  /* States - unchanged */
  [data-state="hidden"] & {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-50px);
  }

  [data-state^="visible"] & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    background: #f4f1e8;
    border: 1px solid #d4d1c8;
    color: #2a2a3e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Clickable state - unchanged */
  [data-clickable="true"] & {
    cursor: pointer;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  /* Deal animation */
  [data-animation="dealing"] & {
    animation: ${dealAnimation} 0.6s calc(var(--card-index) * 50ms) ease-out backwards;
  }
`;

// ===== OVERLAY - Updated with animations =====
export const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  z-index: 1;

  /* Base styling */
  background: var(--team-color);
  border: 2px solid var(--team-border);
  color: white;

  /* Color fade animation for spymaster view */
  [data-state="visible-colored"] & {
    transform: rotateY(0deg);
    background: var(--team-color-transparent);
  }

  [data-animation="color-fade"] [data-state="visible-colored"] & {
    animation: ${colorFadeIn} 0.3s ease-out forwards;
  }

  /* Covered state - fully opaque */
  [data-state="visible-covered"] & {
    opacity: 1;
    transform: rotateY(0deg);
  }

  /* When covering animation plays, card flips to show this */
  [data-animation="covering"] & {
    z-index: 3;
  }

  /* Team symbol when covered */
  &::after {
    content: var(--team-symbol);
    font-size: 4rem;
    opacity: 0;
    position: absolute;
    transition: opacity 0.3s ease;
  }

  [data-state="visible-covered"] &::after {
    opacity: 0.3;
  }
`;

export const CardWord = styled.span`
  position: relative;
  z-index: 2;
  padding: 0 0.5rem;
  text-align: center;
`;
