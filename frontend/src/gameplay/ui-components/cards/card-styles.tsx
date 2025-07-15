import styled, { keyframes } from "styled-components";

// ===== ANIMATIONS - Pure motion, no appearance =====
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


// ===== CONTAINER - Orchestrates everything =====
export const CardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  
  /* Team color variables */
  &[data-team="red"] {
    --team-color: #ff3333;
    --team-color-transparent: #ff3333dd;
    --team-border: #ff6666;
    --team-symbol: '★';
  }
  
  &[data-team="blue"] {
    --team-color: #3399ff;
    --team-color-transparent: #3399ffdd;
    --team-border: #66b3ff;
    --team-symbol: '♦';
  }
  
  &[data-team="assassin"] {
    --team-color: #0a0a0a;
    --team-color-transparent: #0a0a0add;
    --team-border: #ffff00;
    --team-symbol: '☠';
  }
  
  &[data-team="neutral"] {
    --team-color: #8b8b8b;
    --team-color-transparent: #8b8b8bdd;
    --team-border: #aaaaaa;
    --team-symbol: '●';
  }
  
  &[data-team="green"] {
    --team-color: #33cc33;
    --team-color-transparent: #33cc33dd;
    --team-border: #66ff66;
    --team-symbol: '🌿';
  }
`;

// ===== BASE CARD - No defaults, explicit everything =====
export const BaseCard = styled.div`
  /* Layout only - no visual defaults */
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
  
  /* Hidden state */
  [data-state="hidden"] & {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-50px);
  }
  
  /* Any visible state - using prefix matching */
  [data-state^="visible"] & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    background: #f4f1e8;
    border: 1px solid #d4d1c8;
    color: #2a2a3e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* Clickable when data-clickable is true */
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

// ===== OVERLAY - Only for showing team colors =====
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
  
  /* Base styling */
  background: var(--team-color);
  border: 2px solid var(--team-border);
  color: white;
  
  /* Show overlay for colored states - instant, no animation */
  [data-state="visible-colored"] &,
  [data-state="visible-covered"] & {
    opacity: 1;
  }
  
  /* Semi-transparent for spymaster view */
  [data-state="visible-colored"] & {
    background: var(--team-color-transparent);
  }
  
  /* Show team symbol when covered */
  [data-state="visible-covered"] &::after {
    content: var(--team-symbol);
    font-size: 4rem;
    opacity: 0.3;
    position: absolute;
  }
`;

export const CardWord = styled.span`
  position: relative;
  z-index: 2;
  padding: 0 0.5rem;
  text-align: center;
`;