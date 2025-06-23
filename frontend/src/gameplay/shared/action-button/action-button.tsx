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
  font-size: clamp(1rem, 2.5vh, 3vh);
  padding: 0.8rem 2rem;
  font-weight: bold;
  border: none;
  color: ${({ theme }) => theme.buttonText};
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`};
  border-radius: 50px;
  cursor: ${({ enabled }) => (enabled ? "pointer" : "not-allowed")};
  overflow: hidden;
  position: relative;
  outline: none;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  opacity: ${({ enabled }) => (enabled ? 1 : 0.6)};

  &:hover {
    transform: ${({ enabled }) => (enabled ? "scale(1.05)" : "none")};
    box-shadow: ${({ enabled, theme }) =>
      enabled ? `0 4px 15px ${theme.shadowColor}` : "none"};
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
    background: ${({ theme }) => theme.primaryHover};
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
