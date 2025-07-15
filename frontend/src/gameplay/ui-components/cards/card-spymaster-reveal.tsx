import React from "react";
import styled, { keyframes, css } from "styled-components";
import { Card } from "@frontend/shared-types";
import { getTeamType, getCardColor, isYourTeam, getSymbol } from "./card-utils";
import { Z_INDEX } from "@frontend/style/z-index";

// Animations
const gridPulse = keyframes`
  0%, 100% { 
    opacity: 0.3; 
  }
  50% { 
    opacity: 0.6; 
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

// Card-specific AR overlay components
const ARScanGrid = styled.div`
  position: absolute;
  inset: 4px;
  background-image:
    repeating-linear-gradient(0deg, transparent 0, transparent 9px, rgba(255, 255, 255, 0.1) 10px),
    repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(255, 255, 255, 0.1) 10px);
  opacity: 0;
  transition: none; /* Instant */
  border-radius: 6px;
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_GRID};

  /* Subtle grid overlay in spymaster view */
  [data-state="visible-colored"] & {
    opacity: 0.6;
    animation: ${gridPulse} 3s ease-in-out infinite;
  }
`;

const ARWordOverlay = styled.div<{ $teamColor: string; $isYourTeam: boolean }>`
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
    0 0 10px rgba(0, 0, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: none; /* Instant */
  pointer-events: none;

  /* Instant reveal in spymaster view - subtle visibility */
  [data-state="visible-colored"] & {
    opacity: 0.8;
  }

  /* Assassin gets special danger styling */
  [data-state="visible-colored"][data-team-color="#0a0a0a"] & {
    background: rgba(255, 0, 0, 0.9);
    color: #ffff00;
    border: 2px solid #ffff00;
    box-shadow:
      0 0 20px rgba(255, 255, 0, 0.6),
      0 0 40px rgba(255, 0, 0, 0.4);
    animation: ${dangerFlash} 1s ease-in-out infinite;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.25rem 0.6rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.2rem 0.5rem;
  }
`;

const WordBracket = styled.div<{ $bracketColor: string }>`
  position: absolute;
  width: 12px;
  height: 12px;
  
  &.tl {
    top: -6px;
    left: -6px;
    border-top: 3px solid rgba(255, 255, 255, 0.8);
    border-left: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  &.tr {
    top: -6px;
    right: -6px;
    border-top: 3px solid rgba(255, 255, 255, 0.8);
    border-right: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  &.bl {
    bottom: -6px;
    left: -6px;
    border-bottom: 3px solid rgba(255, 255, 255, 0.8);
    border-left: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  &.br {
    bottom: -6px;
    right: -6px;
    border-bottom: 3px solid rgba(255, 255, 255, 0.8);
    border-right: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
    
    &.tl { top: -5px; left: -5px; }
    &.tr { top: -5px; right: -5px; }
    &.bl { bottom: -5px; left: -5px; }
    &.br { bottom: -5px; right: -5px; }
  }
`;

const ARInfoTag = styled.div<{ $teamType: string }>`
  position: absolute;
  top: -6px;
  right: -6px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3px 6px;
  border-radius: 3px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transform: scale(0);
  transition: none; /* Instant */
  display: flex;
  align-items: center;
  gap: 3px;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};
  color: rgba(255, 255, 255, 0.9);

  /* Instant reveal in spymaster view */
  [data-state="visible-colored"] & {
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

const ARClassification = styled.div<{ $teamType: string }>`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%) translateY(15px);
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 8px;
  border-radius: 3px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0;
  transition: none; /* Instant */
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};
  color: rgba(255, 255, 255, 0.9);

  /* Instant reveal in spymaster view */
  [data-state="visible-colored"] & {
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

const ARTargetBracket = styled.div`
  position: absolute;
  inset: 20%;
  border: 1px solid transparent;
  opacity: 0;
  transition: none; /* Instant */
  pointer-events: none;
  z-index: ${Z_INDEX.SPYMASTER_AR_OVERLAY};

  /* Instant reveal on hover in spymaster view */
  [data-state="visible-colored"] &:hover {
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

const TeamSymbolOverlay = styled.div<{
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
  color: rgba(0, 0, 0, 0.2);
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: none; /* Instant */
  filter: none;

  /* Content is the symbol passed as prop */
  &::before {
    content: "${(props) => props.$symbol}";
  }

  /* Assassin special styling */
  ${(props) =>
    props.$isAssassin &&
    `
    color: rgba(255, 255, 0, 0.8);
    text-shadow: 
      0 0 20px rgba(255, 255, 0, 0.8),
      0 0 40px rgba(255, 255, 0, 0.4);
    filter: drop-shadow(0 0 15px rgba(255, 255, 0, 0.6));
  `}

  /* Instant reveal in spymaster view */
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
  }

  @media (min-width: 769px) {
    font-size: 7rem;
  }
`;

export interface SpymasterRevealProps {
  card: Card;
  isVisible: boolean;
}

export const SpymasterReveal: React.FC<SpymasterRevealProps> = ({ card, isVisible }) => {
  if (!isVisible) return null;

  const teamType = getTeamType(card);
  const teamColor = getCardColor(card);
  const isOwnTeam = isYourTeam(card);
  const symbol = getSymbol(teamColor);

  return (
    <>
      {/* Team Symbol Overlay - shows in AR mode and when covered */}
      {symbol && (
        <TeamSymbolOverlay
          $teamColor={teamColor}
          $symbol={symbol}
          $isAssassin={teamColor === "#0a0a0a"}
        />
      )}

      {/* AR Elements - Hidden by default, shown in AR mode via CSS */}
      <ARScanGrid />

      <ARWordOverlay $teamColor={teamColor} $isYourTeam={isOwnTeam}>
        {card.word}

        {/* Targeting brackets for your team */}
        {isOwnTeam && (
          <>
            <WordBracket className="tl" $bracketColor={teamColor} />
            <WordBracket className="tr" $bracketColor={teamColor} />
            <WordBracket className="bl" $bracketColor={teamColor} />
            <WordBracket className="br" $bracketColor={teamColor} />
          </>
        )}
      </ARWordOverlay>

      <ARInfoTag $teamType={teamType} />
      <ARClassification $teamType={teamType} />
      <ARTargetBracket />
    </>
  );
};
