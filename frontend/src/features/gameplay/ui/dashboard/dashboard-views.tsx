// features/gameplay/ui/dashboard/dashboards.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { useGameActions } from "@frontend/features/gameplay/state";
import { useTurn } from "@frontend/features/gameplay/state/active-turn-provider";

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

const ActionButton = styled.button`
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
  color: #666;
  text-align: center;
`;

const GuessCounter = styled.div`
  font-size: 1rem;
  color: #666;
  text-align: center;
`;

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

interface DashboardProps {
  dispatch: (action: any) => void;
}

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

export const CodebreakerDashboardView: React.FC<DashboardProps> = ({
  dispatch,
}) => {
  const { endTurn, actionState } = useGameActions();

  const handleEndTurn = () => {
    endTurn();
  };

  return (
    <DashboardContainer>
      <GuessCounter>Make your guesses by clicking cards</GuessCounter>
      <EndTurnButton
        onClick={handleEndTurn}
        disabled={actionState.status === "loading"}
      >
        {actionState.status === "loading" ? "Ending Turn..." : "End Turn"}
      </EndTurnButton>
    </DashboardContainer>
  );
};

export const CodemasterDashboardView: React.FC<DashboardProps> = ({
  dispatch,
}) => {
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState(1);
  const { giveClue, actionState } = useGameActions();

  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueWord.trim()) return;

    giveClue(clueWord.trim(), clueCount);
    setClueWord("");
    setClueCount(1);
  };

  const isLoading = actionState.status === "loading";

  return (
    <DashboardContainer>
      <ClueForm onSubmit={handleSubmitClue}>
        <InputGroup>
          <ClueInput
            type="text"
            value={clueWord}
            onChange={(e) => setClueWord(e.target.value)}
            placeholder="Enter clue word..."
            disabled={isLoading}
          />
          <CountInput
            type="number"
            min="1"
            max="25"
            value={clueCount}
            onChange={(e) => setClueCount(parseInt(e.target.value) || 1)}
            disabled={isLoading}
          />
        </InputGroup>
        <SubmitButton type="submit" disabled={!clueWord.trim() || isLoading}>
          {isLoading ? "Submitting..." : "Give Clue"}
        </SubmitButton>
      </ClueForm>
    </DashboardContainer>
  );
};

export const OutcomeDashboardView: React.FC<DashboardProps> = ({
  dispatch,
}) => {
  const { activeTurn } = useTurn();

  const handleAcknowledge = () => {
    dispatch({
      type: "TRIGGER_TRANSITION",
      payload: { event: "OUTCOME_ACKNOWLEDGED" },
    });
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

export const LobbyDashboardView: React.FC<DashboardProps> = ({ dispatch }) => {
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

  return (
    <DashboardContainer>
      <ActionButton onClick={handleCreateRound} disabled={isLoading}>
        {isLoading && actionState.name === "createRound"
          ? "Creating..."
          : "Create Round"}
      </ActionButton>

      <ActionButton onClick={handleDealCards} disabled={isLoading}>
        {isLoading && actionState.name === "dealCards"
          ? "Dealing..."
          : "Deal Cards"}
      </ActionButton>

      <ActionButton onClick={handleStartRound} disabled={isLoading}>
        {isLoading && actionState.name === "startRound"
          ? "Starting..."
          : "Start Round"}
      </ActionButton>
    </DashboardContainer>
  );
};

export const WaitingDashboardView: React.FC<DashboardProps> = ({
  dispatch,
}) => {
  return (
    <DashboardContainer>
      <InfoText>Waiting for the other team...</InfoText>
    </DashboardContainer>
  );
};

export const SpectatorDashboardView: React.FC<DashboardProps> = ({
  dispatch,
}) => {
  return (
    <DashboardContainer>
      <InfoText>Watching the game...</InfoText>
    </DashboardContainer>
  );
};
