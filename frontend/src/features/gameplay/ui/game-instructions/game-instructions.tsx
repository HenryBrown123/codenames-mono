import React from "react";
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
  white-space: pre-wrap;
`;

interface GameInstructionsProps {
  messageText: string;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  messageText,
}) => {
  return (
    <MessageContainer>
      <Message>{messageText}</Message>
    </MessageContainer>
  );
};
