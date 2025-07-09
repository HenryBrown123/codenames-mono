import React from "react";
import styled, { keyframes } from "styled-components";

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

const StyledButton = styled.button<{ enabled: boolean }>`
  padding: 1rem 1.5rem;
  border: 1px solid #00ff88;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: ${({ enabled }) => (enabled ? "pointer" : "not-allowed")};
  transition: all 250ms ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "JetBrains Mono", "Courier New", monospace;
  background-color: transparent;
  width: 100%;
  color: #00ff88;
  text-align: center;
  opacity: ${({ enabled }) => (enabled ? 1 : 0.5)};

  &:hover {
    background-color: ${({ enabled }) => enabled ? '#00ff88' : 'transparent'};
    color: ${({ enabled }) => enabled ? '#000' : '#00ff88'};
    box-shadow: ${({ enabled }) => enabled ? '0 5px 15px rgba(0, 255, 136, 0.4)' : 'none'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
      color: #00ff88;
      box-shadow: none;
    }
  }

  &:active {
    transform: ${({ enabled }) => (enabled ? "scale(0.98)" : "none")};
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
    transition: transform 0.5s, opacity 0.5s;
  }

  &:active::before {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
    animation: ${rippleEffect} 0.6s ease-out;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
`;

type ButtonProp = {
  text?: string;
  enabled?: boolean;
  onClick: () => void;
};

const ActionButton: React.FC<ButtonProp> = ({
  text = "Submit",
  enabled = true,
  onClick,
}) => {
  return (
    <StyledButton enabled={enabled} onClick={enabled ? onClick : undefined}>
      {text}
    </StyledButton>
  );
};

export default ActionButton;
export { ActionButton };
