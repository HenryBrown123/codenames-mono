import React, { useState, useEffect } from "react";
import styled from "styled-components";

const MessageContainer = styled.div`
  padding-left: 1rem;
  height: 100%;
  text-align: left;
  display: flex;
  align-items: center;
`;

const Message = styled.p`
  border-radius: 15px;
  width: 100%;
  margin: 0;
  color: var(--color-text);
  white-space: pre-wrap; /* Preserves line breaks */
`;

interface GameInstructionsProps {
  messageText: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ messageText }) => {
  const [displayedText] = useState(messageText);

  return (
    <MessageContainer>
      <Message>{displayedText}</Message>
    </MessageContainer>
  );
};

export default GameInstructions;
