import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { usePlayerRoleScene } from "@frontend/gameplay/role-scenes";
import { useTurn } from "@frontend/gameplay/turn-management";
import { Turn } from "@frontend/shared-types";
import { ActionButton } from "@frontend/gameplay/shared/action-button";

// ============================================================================
// STYLED COMPONENTS (Master Branch Style)
// ============================================================================

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

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export const CodebreakerDashboardView: React.FC = () => {
  const { activeTurn } = useTurn();
  const { endTurn, actionState } = useGameActions();

  const handleEndTurn = () => {
    endTurn();
  };

  const hasClueWithWord = activeTurn?.clue?.word;
  const canEndTurn = hasClueWithWord && (activeTurn?.guessesRemaining || 0) > 0;

  // hasClueWithWord not used directly
  if (!activeTurn?.clue?.word) {
    return <Container />;
  }

  return (
    <Container>
      <CodeWordInput
        codeWord={activeTurn.clue.word}
        numberOfCards={activeTurn.clue.number}
        isEditable={false}
        isLoading={false}
      />
      <ButtonWrapper>
        <ActionButton
          onClick={handleEndTurn}
          text={
            actionState.status === "loading" ? "Ending Turn..." : "End Turn"
          }
          enabled={(canEndTurn && actionState.status !== "loading") || false}
        />
      </ButtonWrapper>
    </Container>
  );
};

export const CodemasterDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { giveClue, actionState } = useGameActions();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
  };

  // If clue already given, show empty dashboard (message handles the text)
  if (activeTurn?.clue) {
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

export const OutcomeDashboardView: React.FC = () => {
  const { handleSceneTransition } = usePlayerRoleScene();

  const handleContinue = () => {
    handleSceneTransition("OUTCOME_ACKNOWLEDGED");
  };

  return (
    <ButtonWrapper>
      <ActionButton onClick={handleContinue} text="Continue" enabled={true} />
    </ButtonWrapper>
  );
};

export const LobbyDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const handleClick = () => {
    if (
      gameData?.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards &&
      gameData.currentRound.cards.length > 0
    ) {
      startRound();
      return;
    }

    if (
      gameData?.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      dealCards();
      return;
    }

    if (!gameData?.currentRound) {
      createRound();
      return;
    }
  };

  const getButtonText = () => {
    if (!gameData?.currentRound) {
      return "Create New Game";
    }

    if (
      gameData.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      return "Deal Cards";
    }

    if (
      gameData.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards?.length > 0
    ) {
      return "Start Round";
    }

    return "Continue Game";
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text={actionState.status === "loading" ? "Loading..." : getButtonText()}
        enabled={actionState.status !== "loading"}
      />
    </ButtonWrapper>
  );
};

export const DealingDashboardView: React.FC = () => {
  return (
    <Container>
      <LoadingSpinner />
    </Container>
  );
};

export const WaitingDashboardView: React.FC = () => {
  return <Container />;
};

export const SpectatorDashboardView: React.FC = () => {
  return <Container />;
};

export const GameoverDashboardView: React.FC = () => {
  const { createRound, actionState } = useGameActions();

  const handleNewGame = () => {
    createRound();
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleNewGame}
        text={
          actionState.status === "loading" && actionState.name === "createRound"
            ? "Creating..."
            : "New Game"
        }
        enabled={actionState.status !== "loading"}
      />
    </ButtonWrapper>
  );
};
