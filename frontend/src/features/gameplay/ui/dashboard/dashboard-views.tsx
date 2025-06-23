import React, { useState } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import { CodeWordInput } from "./codemaster-input";
import { useGameData, useGameActions } from "@frontend/features/gameplay/state";
import { useTurn } from "@frontend/features/gameplay/state/active-turn-provider";
import { Turn } from "@frontend/shared-types";

// ============================================================================
// SHARED STYLED COMPONENTS
// ============================================================================

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const BasicActionButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  border: 2px solid #007bff;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #0056b3;
    border-color: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }
`;

const EndTurnButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: 2px solid #dc3545;
  border-radius: 8px;
  background: #dc3545;
  color: white;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #c82333;
    border-color: #c82333;
  }

  &:disabled {
    background: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ClueForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ClueInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
  }
`;

const CountInput = styled.input`
  width: 80px;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #218838;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const OutcomeDisplay = styled.div`
  text-align: center;

  h3 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const ContinueButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const InfoText = styled.div`
  font-size: 1rem;
  color: white;
  text-align: center;
`;

const GuessCounter = styled.div`
  font-size: 1rem;
  color: white;
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

const getOutcomeMessage = (outcome: string): string => {
  switch (outcome) {
    case "CORRECT_TEAM":
      return "✅ Correct!";
    case "WRONG_TEAM":
      return "❌ Wrong team";
    case "NEUTRAL":
      return "⚪ Neutral card";
    case "ASSASSIN":
      return "💀 Game over!";
    default:
      return outcome;
  }
};

export const CodebreakerDashboardView: React.FC = () => {
  const { endTurn, actionState } = useGameActions();

  const handleEndTurn = () => {
    endTurn();
  };

  return (
    <ButtonWrapper>
      <EndTurnButton
        onClick={handleEndTurn}
        disabled={actionState.status === "loading"}
      >
        {actionState.status === "loading" ? "Ending Turn..." : "End Turn"}
      </EndTurnButton>
    </ButtonWrapper>
  );
};

export const CodemasterDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { giveClue, actionState } = useGameActions();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );
  const codeWord = activeTurn?.clue?.word || "";
  const numberOfGuesses = activeTurn?.clue?.number || 0;

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
  };

  return (
    <Container>
      <CodeWordInput
        codeWord={codeWord}
        numberOfCards={numberOfGuesses}
        isEditable={!activeTurn?.clue}
        isLoading={actionState.status === "loading"}
        onSubmit={handleSubmitClue}
      />
    </Container>
  );
};

export const OutcomeDashboardView: React.FC = () => {
  const { activeTurn } = useTurn();

  const handleAcknowledge = () => {
    // This would be handled by the scene provider
    console.log("Outcome acknowledged");
  };

  if (!activeTurn?.lastGuess) {
    return (
      <DashboardContainer>
        <div>No outcome to display</div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <OutcomeDisplay>
        <h3>{getOutcomeMessage(activeTurn.lastGuess.outcome)}</h3>
        <p>You guessed: "{activeTurn.lastGuess.cardWord}"</p>
      </OutcomeDisplay>
      <ContinueButton onClick={handleAcknowledge}>Continue</ContinueButton>
    </DashboardContainer>
  );
};

export const LobbyDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const handleCreateRound = () => {
    createRound();
  };

  const handleStartRound = () => {
    startRound();
  };

  const handleDealCards = () => {
    dealCards();
  };

  const isLoading = actionState.status === "loading";

  // Determine which buttons to show based on game state
  const showCreateRound = !gameData?.currentRound;
  const showDealCards =
    gameData?.currentRound?.status === "SETUP" &&
    (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0);
  const showStartRound =
    gameData?.currentRound?.status === "SETUP" &&
    gameData.currentRound.cards &&
    gameData.currentRound.cards.length > 0;

  return (
    <DashboardContainer>
      {showCreateRound && (
        <ActionButton
          onClick={handleCreateRound}
          enabled={!isLoading}
          text={
            isLoading && actionState.name === "createRound"
              ? "Creating..."
              : "Create Round"
          }
        />
      )}

      {showDealCards && (
        <ActionButton
          onClick={handleDealCards}
          enabled={!isLoading}
          text={
            isLoading && actionState.name === "dealCards"
              ? "Dealing..."
              : "Deal Cards"
          }
        />
      )}

      {showStartRound && (
        <ActionButton
          onClick={handleStartRound}
          enabled={!isLoading}
          text={
            isLoading && actionState.name === "startRound"
              ? "Starting..."
              : "Start Round"
          }
        />
      )}
    </DashboardContainer>
  );
};

export const DealingDashboardView: React.FC = () => {
  const { actionState } = useGameActions();

  const getStatusText = () => {
    switch (actionState.status) {
      case "loading":
        return "Dealing cards...";
      case "success":
        return "Cards dealt! Returning to lobby...";
      case "error":
        return "Error dealing cards";
      default:
        return "Preparing to deal cards...";
    }
  };

  return (
    <Container>
      <LoadingSpinner />
      <InfoText>{getStatusText()}</InfoText>
      {actionState.status === "error" && actionState.error && (
        <InfoText style={{ color: "#ff6b6b", fontSize: "1rem" }}>
          {actionState.error.message}
        </InfoText>
      )}
    </Container>
  );
};

export const WaitingDashboardView: React.FC = () => {
  return (
    <Container>
      <InfoText>Waiting for the other team...</InfoText>
    </Container>
  );
};

export const SpectatorDashboardView: React.FC = () => {
  return (
    <Container>
      <InfoText>Watching the game...</InfoText>
    </Container>
  );
};

export const GameoverDashboardView: React.FC = () => {
  return (
    <Container>
      <InfoText>🎉 Game Over!</InfoText>
    </Container>
  );
};
