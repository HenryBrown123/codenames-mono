import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const typewriterBlink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

const glitchPulse = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 2px var(--color-primary, #00ff88),
      0 0 4px var(--color-primary, #00ff88);
  }
  50% {
    text-shadow: 
      0 0 4px var(--color-primary, #00ff88),
      0 0 8px var(--color-primary, #00ff88),
      0 0 12px var(--color-primary, #00ff88);
  }
`;

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
  min-width: 0;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: "JetBrains Mono", "Courier New", monospace;
`;

/**
 * MOBILE-FIRST: Message text optimized for readability with typewriter effect
 */
const Message = styled.p`
  /* Mobile-first: Clean, readable text with terminal styling */
  margin: 0;
  color: var(--color-primary, #00ff88);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-weight: 500;
  line-height: 1.3;
  font-family: "JetBrains Mono", "Courier New", monospace;
  animation: ${glitchPulse} 4s ease-in-out infinite;

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

const Cursor = styled.span`
  display: inline-block;
  background-color: var(--color-primary, #00ff88);
  width: 2px;
  height: 1.2em;
  margin-left: 2px;
  animation: ${typewriterBlink} 1s infinite;
`;

interface GameInstructionsProps {
  messageText: string;
}

/**
 * Game instructions component with mobile-first responsive design and typewriter effect
 */
export const GameInstructions: React.FC<GameInstructionsProps> = ({ messageText }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < messageText.length) {
        setDisplayedText(messageText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50); // Typing speed

    return () => clearInterval(typeInterval);
  }, [messageText]);

  return (
    <MessageContainer>
      <Message>
        {displayedText}
        {isTyping && <Cursor />}
      </Message>
    </MessageContainer>
  );
};
