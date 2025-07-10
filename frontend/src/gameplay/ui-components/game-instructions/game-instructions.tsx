import React from "react";
import styled from "styled-components";

/**
 * MOBILE-FIRST: Instructions container that adapts to screen size
 */
const MessageContainer = styled.div`
  /* Mobile-first: Compact, centered instructions */
  padding: 0;
  height: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * MOBILE-FIRST: Message text optimized for readability
 */
const Message = styled.p`
  /* Mobile-first: Clean, readable text */
  margin: 0;
  color: var(--color-text);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-weight: 500;
  line-height: 1.3;

  /* Mobile text sizing handled by parent container */
  font-size: inherit;

  /* PROGRESSIVE ENHANCEMENT: Tablet - better typography */
  @media (min-width: 481px) {
    font-weight: 600;
    line-height: 1.4;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - enhanced readability */
  @media (min-width: 1025px) {
    line-height: 1.5;
  }
`;

interface GameInstructionsProps {
  messageText: string;
}

/**
 * Game instructions component with mobile-first responsive design
 */
export const GameInstructions: React.FC<GameInstructionsProps> = ({ messageText }) => {
  return (
    <MessageContainer>
      <Message>{messageText}</Message>
    </MessageContainer>
  );
};
