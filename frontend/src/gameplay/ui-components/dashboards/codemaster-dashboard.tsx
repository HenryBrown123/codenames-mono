import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";

/**
 * MOBILE-FIRST: Dashboard container that adapts to layout context
 */
const Container = styled.div`
  /* Mobile-first: Horizontal layout for bottom dashboard */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 1rem;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - vertical in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - more space */
  @media (min-width: 1025px) {
    gap: 2rem;
    padding: 1.5rem;
  }
`;

/**
 * Codemaster Dashboard - Handles clue input
 */
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
      <CodeWordInput
        codeWord=""
        numberOfCards={null}
        isEditable={true}
        isLoading={actionState.status === "loading"}
        onSubmit={handleSubmitClue}
      />
    </Container>
  );
};
