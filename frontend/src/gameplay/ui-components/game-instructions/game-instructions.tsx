import React from "react";
import styled from "styled-components";

const MessageContainer = styled.div`
  height: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h3`
  color: #00ff88;
  font-size: 1.25rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "JetBrains Mono", "Courier New", monospace;
  animation: glitch 4s infinite;
  
  @keyframes glitch {
    0%, 100% {
      text-shadow:
        0 0 2px #00ff88,
        0 0 4px #00ff88;
    }
    25% {
      text-shadow:
        -2px 0 #ff0040,
        2px 0 #00d4ff;
    }
    50% {
      text-shadow:
        2px 0 #ff0080,
        -2px 0 #00ff88;
    }
    75% {
      text-shadow:
        0 0 2px #00d4ff,
        0 0 4px #00d4ff;
    }
  }
`;

const Message = styled.p`
  width: 100%;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  white-space: pre-wrap;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
`;

interface GameInstructionsProps {
  messageText: string;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  messageText,
}) => {
  return (
    <MessageContainer>
      <Title>Mission Briefing</Title>
      <Message>{messageText}</Message>
    </MessageContainer>
  );
};
