import React from "react";
import styled, { keyframes, css } from "styled-components";

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

const dataStream = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 -100%;
  }
`;

const arRevealGlow = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.3),
      inset 0 0 20px rgba(0, 255, 136, 0.05);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(0, 255, 136, 0.6),
      inset 0 0 30px rgba(0, 255, 136, 0.1);
  }
`;

const StyledARButton = styled.button<{ $arMode: boolean; enabled: boolean }>`
  /* Base styling matching ActionButton */
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: clamp(0.9rem, 2.5vh, 1.2rem);
  padding: 0.8rem 2rem;
  font-weight: 700;
  border: 1px solid var(--color-primary, #00ff88);
  color: ${({ $arMode }) => ($arMode ? "#000" : "var(--color-primary, #00ff88)")};
  background: ${({ $arMode }) => ($arMode ? "var(--color-primary, #00ff88)" : "transparent")};
  border-radius: 8px;
  cursor: ${({ enabled }) => (enabled ? "pointer" : "not-allowed")};
  overflow: hidden;
  position: relative;
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
  opacity: ${({ enabled }) => (enabled ? 1 : 0.6)};
  
  /* Enhanced styling when AR mode is active */
  ${({ $arMode }) => $arMode && css`
    animation: ${arRevealGlow} 2s ease-in-out infinite;
    border-color: #00ff88;
  `}
  
  /* Glitch effect on text when not in AR mode (overridden by AR mode above) */
  ${({ enabled, $arMode }) => !$arMode && enabled && css`
    animation: ${glitchAnimation} 4s infinite;
  `}
  
  /* Data stream background effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 2px,
      rgba(0, 255, 136, 0.03) 2px,
      rgba(0, 255, 136, 0.03) 4px
    );
    animation: ${dataStream} 10s linear infinite;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-primary, #00ff88);
    color: #000;
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.5),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
    transform: translateY(-2px);
    animation: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    font-size: clamp(0.85rem, 2vh, 1rem);
    padding: 0.6rem 1.5rem;
    min-height: 44px;
  }
`;

interface ARRevealButtonProps {
  arMode: boolean;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ARRevealButton: React.FC<ARRevealButtonProps> = ({
  arMode,
  enabled = true,
  onClick,
  className,
  children,
}) => {
  return (
    <StyledARButton 
      $arMode={arMode}
      enabled={enabled} 
      onClick={enabled ? onClick : undefined}
      className={className}
      disabled={!enabled}
    >
      {children || (arMode ? "DISABLE AR" : "REVEAL")}
    </StyledARButton>
  );
};