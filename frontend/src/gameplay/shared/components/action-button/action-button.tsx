import React from "react";
import styled, { keyframes } from "styled-components";

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

const StyledButton = styled.button<{ enabled: boolean }>`
  /* Base button matching design system */
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: clamp(0.9rem, 2.5vh, 1.2rem);
  padding: 0.8rem 2rem;
  font-weight: 700;
  border: 1px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  background: transparent;
  border-radius: 8px;
  cursor: ${({ enabled }) => (enabled ? "pointer" : "not-allowed")};
  overflow: hidden;
  position: relative;
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
  opacity: ${({ enabled }) => (enabled ? 1 : 0.6)};
  
  /* Glitch effect on text */
  animation: ${({ enabled }) => (enabled ? glitchAnimation : "none")} 4s infinite;
  
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

type ButtonProp = {
  text?: string;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
};

const ActionButton: React.FC<ButtonProp> = ({
  text = "EXECUTE",
  enabled = true,
  onClick,
  className,
}) => {
  return (
    <StyledButton 
      enabled={enabled} 
      onClick={enabled ? onClick : undefined}
      className={className}
      disabled={!enabled}
    >
      {text}
    </StyledButton>
  );
};

export default ActionButton;