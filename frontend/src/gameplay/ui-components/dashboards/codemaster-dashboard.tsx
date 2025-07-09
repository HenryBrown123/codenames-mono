import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 1.5rem;
`;

const ClueDisplay = styled.div`
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  
  h4 {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    margin: 0;
    font-family: "JetBrains Mono", "Courier New", monospace;
  }
  
  .clue-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #00ff88;
    text-shadow: 0 0 20px #00ff88;
    font-family: "JetBrains Mono", "Courier New", monospace;
  }
`;

export const CodemasterDashboard: React.FC = () => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
  };

  if (!activeTurn || activeTurn.clue !== null) {
    return <Container />;
  }

  return (
    <Container>
      <ClueDisplay>
        <h4>Current Intel</h4>
        <CodeWordInput
          codeWord=""
          numberOfCards={null}
          isEditable={true}
          isLoading={actionState.status === "loading"}
          onSubmit={handleSubmitClue}
        />
      </ClueDisplay>
    </Container>
  );
};