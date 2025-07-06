import React from "react";
import styled from "styled-components";
import { useGameActions } from "../../player-actions";
import { usePlayerScene } from "../../player-scenes";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { CodeWordInput } from "./codemaster-input";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
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
    <ButtonWrapper>
      <ActionButton onClick={handleContinue} text="Continue" enabled={true} />
    </ButtonWrapper>
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
    <ButtonWrapper>
      <ActionButton
        onClick={handleNewGame}
        text="New Game"
        enabled={actionState.status !== "loading"}
      />
    </ButtonWrapper>
  );
};