import React from "react";
import styled from "styled-components";
import { useGameActions } from "../../player-actions";
import { usePlayerScene } from "../../player-scenes";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { CodeWordInput } from "./codemaster-input";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 1rem;
  gap: 2rem;

  /* Desktop/Tablet sidebar - vertical */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
  }

  /* Mobile landscape - keep horizontal */
  @media (max-width: 768px) and (orientation: landscape) {
    flex-direction: row;
    padding: 0.5rem;
    gap: 1rem;
  }

  @media (max-width: 768px) and (orientation: portrait) {
    padding: 0.5rem;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
`;


const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #4dabf7;
  animation: spin 1s ease-in-out infinite;
  margin: 1rem 0;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const WaitingDashboard: React.FC = () => {
  return <Container />;
};

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

export const OutcomeDashboard: React.FC = () => {
  const { triggerSceneTransition } = usePlayerScene();

  const handleContinue = () => {
    triggerSceneTransition("OUTCOME_ACKNOWLEDGED");
  };

  return (
    <Container style={{ justifyContent: 'center' }}>
      <ActionButton onClick={handleContinue} text="Continue" enabled={true} />
    </Container>
  );
};

export const DealingDashboard: React.FC = () => {
  return (
    <Container>
      <LoadingSpinner />
    </Container>
  );
};

export const SpectatorDashboard: React.FC = () => {
  return <Container />;
};

export const GameoverDashboard: React.FC = () => {
  const { createRound, actionState } = useGameActions();

  const handleNewGame = () => {
    createRound();
  };

  return (
    <Container style={{ justifyContent: 'center' }}>
      <ActionButton
        onClick={handleNewGame}
        text="New Game"
        enabled={actionState.status !== "loading"}
      />
    </Container>
  );
};