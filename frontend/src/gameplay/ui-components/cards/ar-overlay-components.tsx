/**
 * AR Overlay Components
 *
 * Visual enhancement components for AR Glasses mode in Spymaster view.
 * These components add sci-fi/tactical overlays to existing cards without
 * changing any game state management.
 */

import React from "react";
import styled, { keyframes, css } from "styled-components";
import { Z_INDEX } from "@frontend/style/z-index";

// Animations from the prototype
const gridPulse = keyframes`
  0%, 100% { 
    opacity: 0.3; 
  }
  50% { 
    opacity: 0.6; 
  }
`;

const glitchAnimation = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 2px var(--color-primary, #00ff88),
      0 0 4px var(--color-primary, #00ff88);
  }
  25% {
    text-shadow: 
      -2px 0 var(--color-accent, #ff0080),
      2px 0 var(--color-team-blue, #00d4ff);
  }
  50% {
    text-shadow: 
      2px 0 var(--color-accent, #ff0080),
      -2px 0 var(--color-primary, #00ff88);
  }
  75% {
    text-shadow: 
      0 0 2px var(--color-team-blue, #00d4ff),
      0 0 4px var(--color-team-blue, #00d4ff);
  }
`;

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const glareAnimation = keyframes`
  0%, 100% { 
    transform: translateX(-100%) translateY(-100%); 
  }
  50% { 
    transform: translateX(100%) translateY(100%); 
  }
`;

const dangerFlash = keyframes`
  0%, 100% { 
    opacity: 0.95;
  }
  50% { 
    opacity: 1;
  }
`;

const subtleBlink = keyframes`
  0%, 100% { 
    opacity: 0.9; 
  }
  50% { 
    opacity: 1; 
  }
`;

/**
 * Scan grid overlay that appears over cards in AR mode
 */
export const ARScanGrid = styled.div`
  position: absolute;
  inset: 4px; /* Pull inside the card border */
  background-image:
    repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.1) 10px),
    repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(0, 255, 136, 0.1) 10px);
  opacity: 0;
  transition: opacity 0.5s ease;
  border-radius: 6px;
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_GRID};

  /* Show in AR mode when cards are colored (spymaster view) */
  [data-ar-mode="true"] [data-state="visible-colored"] & {
    opacity: 0.8;
    background-color: rgba(0, 255, 136, 0.1);
    animation: ${gridPulse} 2s ease-in-out infinite;
  }
`;

/**
 * Word overlay with targeting brackets for team cards
 */
export const ARWordOverlay = styled.div<{ $teamColor: string; $isYourTeam: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "JetBrains Mono", monospace;
  font-weight: 900;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  white-space: nowrap;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};
  color: white;
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.7);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;

  /* Show in AR mode when cards are colored (spymaster view) */
  [data-ar-mode="true"] [data-state="visible-colored"] & {
    opacity: 1;
    background: rgba(0, 255, 136, 0.9);
    color: #000;
    font-weight: 900;
  }

  /* Assassin gets special danger styling */
  [data-ar-mode="true"] [data-team-color="#0a0a0a"] & {
    background: rgba(255, 0, 0, 0.8);
    box-shadow:
      0 0 0 3px rgba(255, 255, 0, 0.9),
      0 0 40px rgba(255, 255, 0, 0.5);
    animation: ${dangerFlash} 1s ease-in-out infinite;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.2rem 0.6rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.15rem 0.5rem;
  }
`;

/**
 * Corner brackets for targeting your team's words
 */
export const WordBracket = styled.div<{ $bracketColor: string }>`
  position: absolute;
  width: 12px;
  height: 12px;

  &.tl {
    top: -6px;
    left: -6px;
    border-top: 3px solid ${(props) => props.$bracketColor};
    border-left: 3px solid ${(props) => props.$bracketColor};
  }

  &.tr {
    top: -6px;
    right: -6px;
    border-top: 3px solid ${(props) => props.$bracketColor};
    border-right: 3px solid ${(props) => props.$bracketColor};
  }

  &.bl {
    bottom: -6px;
    left: -6px;
    border-bottom: 3px solid ${(props) => props.$bracketColor};
    border-left: 3px solid ${(props) => props.$bracketColor};
  }

  &.br {
    bottom: -6px;
    right: -6px;
    border-bottom: 3px solid ${(props) => props.$bracketColor};
    border-right: 3px solid ${(props) => props.$bracketColor};
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    width: 10px;
    height: 10px;

    &.tl {
      top: -5px;
      left: -5px;
    }
    &.tr {
      top: -5px;
      right: -5px;
    }
    &.bl {
      bottom: -5px;
      left: -5px;
    }
    &.br {
      bottom: -5px;
      right: -5px;
    }
  }
`;

/**
 * Info tags showing team classification and codes
 */
export const ARInfoTag = styled.div<{ $teamType: string }>`
  position: absolute;
  top: -8px;
  right: -8px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transform: scale(0);
  transition: transform 0.3s ease 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};

  /* Show in AR mode */
  [data-ar-mode="true"] & {
    transform: scale(1);
  }

  /* Team-specific styling */
  ${(props) => {
    switch (props.$teamType) {
      case "red":
        return `
          border-color: rgba(255, 0, 64, 0.8);
          color: rgba(255, 0, 64, 0.8);
          box-shadow: 0 0 10px rgba(255, 0, 64, 0.3);
          &::before { content: "★ R-01"; }
        `;
      case "blue":
        return `
          border-color: rgba(0, 212, 255, 0.8);
          color: rgba(0, 212, 255, 0.8);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
          &::before { content: "♦ B-02"; }
        `;
      case "neutral":
        return `
          border-color: rgba(150, 150, 150, 0.6);
          color: rgba(150, 150, 150, 0.6);
          &::before { content: "● N-00"; }
        `;
      case "assassin":
        return css`
          border-color: rgba(255, 255, 0, 0.9);
          color: rgba(255, 255, 0, 0.9);
          box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
          animation: ${subtleBlink} 2s ease-in-out infinite;
          &::before {
            content: "☠ X-99";
          }
        `;
      default:
        return "";
    }
  }}

  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 3px 6px;
    top: -6px;
    right: -6px;
  }
`;

/**
 * Classification labels at bottom of cards
 */
export const ARClassification = styled.div<{ $teamType: string }>`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(0, 0, 0, 0.95);
  padding: 4px 12px;
  border-radius: 4px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0;
  transition: all 0.3s ease 0.4s;
  white-space: nowrap;
  border: 1px solid;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};

  /* Show in AR mode */
  [data-ar-mode="true"] & {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  /* Team-specific styling */
  ${(props) => {
    switch (props.$teamType) {
      case "red":
        return `
          color: #ff0040;
          border-color: #ff0040;
          box-shadow: 0 0 20px rgba(255, 0, 64, 0.5);
          &::before { content: "RED AGENT"; }
        `;
      case "blue":
        return `
          color: #00d4ff;
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          &::before { content: "BLUE AGENT"; }
        `;
      case "neutral":
        return `
          color: #999;
          border-color: #666;
          &::before { content: "CIVILIAN"; }
        `;
      case "assassin":
        return css`
          color: #ffff00;
          border-color: #ffff00;
          box-shadow: 0 0 30px rgba(255, 255, 0, 0.7);
          animation: ${subtleBlink} 0.5s step-end infinite;
          &::before {
            content: "!! ASSASSIN !!";
          }
        `;
      default:
        return "";
    }
  }}

  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 3px 8px;
    bottom: 6px;
  }
`;

/**
 * Targeting crosshair that appears on hover
 */
export const ARTargetBracket = styled.div`
  position: absolute;
  inset: 20%;
  border: 1px solid transparent;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};

  /* Show on hover in AR mode */
  [data-ar-mode="true"] &:hover {
    inset: 10%;
    opacity: 1;
    border-color: rgba(0, 255, 136, 0.5);
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: rgba(0, 255, 136, 0.8);
  }

  &::before {
    top: 50%;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    height: 100%;
    width: 1px;
    transform: translateX(-50%);
  }
`;

/**
 * Full-screen AR HUD overlay with glasses effect
 */
export const ARGlassesHUD = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 1; /* Always visible when rendered */
  z-index: ${Z_INDEX.SPYMASTER_AR_HUD};
  display: flex;
  flex-direction: column;
`;

/**
 * Darkening visor effect
 */
export const ARVisor = styled.div`
  position: absolute;
  inset: 0;
  /* background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  ); */
`;

/**
 * Reflection/glare effect
 */
export const ARGlare = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(0, 255, 136, 0.03) 45%,
    rgba(0, 255, 136, 0.05) 50%,
    transparent 55%
  );
  animation: ${glareAnimation} 8s ease-in-out infinite;
`;

/**
 * Scanline effect
 */
export const ARScanlines = styled.div`
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 136, 0.03) 2px,
    rgba(0, 255, 136, 0.03) 4px
  );
  animation: ${scanlineAnimation} 8s linear infinite;
`;

/**
 * HUD content container
 */
export const ARHUDContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  font-family: "JetBrains Mono", monospace;
  color: #00ff88;
`;

/**
 * Top status bar
 */
export const ARHUDTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

/**
 * HUD status group
 */
export const ARHUDStatus = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

/**
 * Individual HUD line
 */
export const ARHUDLine = styled.div<{ $alert?: boolean }>`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  opacity: 0.9;

  &::before {
    content: "> ";
    opacity: 0.5;
  }

  ${(props) =>
    props.$alert &&
    css`
      color: #ffff00;
      animation: ${subtleBlink} 1s ease-in-out infinite;
    `}

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

/**
 * Corner brackets for screen edge effect
 */
export const ARCornerBrackets = styled.div`
  position: absolute;
  inset: 40px;
  pointer-events: none;

  @media (max-width: 768px) {
    inset: 20px;
  }
`;

export const ARCorner = styled.div<{ $position: "tl" | "tr" | "bl" | "br" }>`
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(0, 255, 136, 0.4);

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

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

/**
 * Central crosshair reticle
 */
export const ARCrosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  opacity: 0.2;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: #00ff88;
  }

  &::before {
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

/**
 * Team Symbol Overlay for game cards
 * Shows in spymaster view and when cards are covered
 */
export const TeamSymbolOverlay = styled.div<{
  $teamColor: string;
  $symbol: string;
  $isAssassin: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: 900;
  color: ${(props) => (props.$isAssassin ? "rgba(255, 255, 0, 0.5)" : "rgba(0, 0, 0, 0.4)")};
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));

  /* Content is the symbol passed as prop */
  &::before {
    content: "${(props) => props.$symbol}";
  }

  /* Assassin special styling */
  ${(props) =>
    props.$isAssassin &&
    `
    color: rgba(255, 255, 0, 0.5);
    text-shadow: 
      0 0 10px rgba(255, 255, 0, 0.4),
      0 0 20px rgba(255, 255, 0, 0.2);
    filter: drop-shadow(0 0 8px rgba(255, 255, 0, 0.5));
  `}

  /* Show symbols in spymaster view (visible-colored state) */
  [data-state="visible-colored"] & {
    opacity: 1;
  }

  /* Show symbols when card is covered */
  [data-state="covered"] & {
    opacity: 1;
  }

  /* PROGRESSIVE ENHANCEMENT: Larger icons on bigger screens */
  @media (min-width: 481px) {
    font-size: 5rem;
    color: ${(props) => (props.$isAssassin ? "rgba(255, 255, 0, 0.55)" : "rgba(0, 0, 0, 0.45)")};
  }

  @media (min-width: 769px) {
    font-size: 7rem;
    color: ${(props) => (props.$isAssassin ? "rgba(255, 255, 0, 0.6)" : "rgba(0, 0, 0, 0.5)")};
  }
`;
