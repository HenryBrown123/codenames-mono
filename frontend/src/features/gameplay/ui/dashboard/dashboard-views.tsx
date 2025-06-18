import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import {
  useGameData,
  useUIScene,
  useGameActions,
} from "@frontend/features/gameplay/state";
import { Turn } from "@frontend/shared-types";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
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

const InfoText = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 1.2rem;
  text-align: center;
  margin: 0.5rem 0;
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

// Lobby dashboard with enhanced state handling
export const LobbyDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { handleSceneTransition } = useUIScene();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const handleClick = () => {
    // Case 2: Round exists with cards - start the round
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
      gameData.currentRound.cards.length === 0
    ) {
      dealCards();
      return;
    }

    // Case 3: No round exists - create new round (will auto-deal cards)
    if (!gameData?.currentRound) {
      createRound();
      return;
    }

    // Case 4: Round exists but no cards - should not happen with auto-dealing
    console.warn("Unexpected state: round exists but no cards");
  };

  const getButtonText = () => {
    if (
      gameData?.currentRound?.status !== "SETUP" &&
      gameData?.status === "IN_PROGRESS"
    ) {
      return "Join Game";
    }

    if (
      gameData?.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards.length === 0
    ) {
      return "Deal Cards";
    }

    if (
      gameData?.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards &&
      gameData.currentRound.cards.length > 0
    ) {
      return "Start Game";
    }

    return "Create Game";
  };

  const getInfoText = () => {
    if (
      gameData?.currentRound &&
      gameData.currentRound.cards &&
      gameData.currentRound.cards.length > 0
    ) {
      return "Cards are ready! Review the board and start when ready.";
    }
    return null;
  };

  const infoText = getInfoText();

  return (
    <Container>
      {infoText && <InfoText>{infoText}</InfoText>}
      <ButtonWrapper>
        <ActionButton
          onClick={handleClick}
          text={getButtonText()}
          enabled={actionState.status !== "loading"}
        />
      </ButtonWrapper>
    </Container>
  );
};

// Simplified dealing dashboard - just shows loading, no transition logic
export const DealingDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { dealCards, actionState } = useGameActions();
  const hasDealtRef = React.useRef(false);

  useEffect(() => {
    // Auto-deal cards when this dashboard mounts (only once)
    if (
      !hasDealtRef.current &&
      gameData?.currentRound &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      hasDealtRef.current = true;
      dealCards();
    }
  }, [gameData?.currentRound, dealCards]);

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

// Spectator dashboard
export const SpectatorDashboardView: React.FC = () => {
  return (
    <Container>
      <InfoText>Watching the game...</InfoText>
    </Container>
  );
};

// Waiting dashboard
export const WaitingDashboardView: React.FC = () => {
  return (
    <Container>
      <InfoText>Waiting for the other team...</InfoText>
    </Container>
  );
};

// Codemaster dashboard
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

// Codebreaker dashboard
export const CodebreakerDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { endTurn, actionState } = useGameActions();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );

  const handleEndTurn = () => {
    endTurn();
  };

  const hasClue = !!activeTurn?.clue;
  const canEndTurn = hasClue && activeTurn.guessesRemaining > 0;

  return (
    <ButtonWrapper>
      {hasClue ? (
        <ActionButton
          onClick={handleEndTurn}
          text="End Turn"
          enabled={canEndTurn && actionState.status !== "loading"}
        />
      ) : (
        <Container>
          <InfoText>Waiting for clue...</InfoText>
        </Container>
      )}
    </ButtonWrapper>
  );
};

// Gameover dashboard
export const GameoverDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { actionState, createRound } = useGameActions();
  const { handleSceneTransition } = useUIScene();

  const handleNewGame = () => {
    createRound();
  };

  const handleBackToLobby = () => {
    handleSceneTransition("BACK_TO_LOBBY");
  };

  const getWinnerText = () => {
    if (gameData.currentRound?.status === "COMPLETED") {
      return "Game completed!";
    }
    return "Game over!";
  };

  return (
    <Container>
      <h2 style={{ color: "#4dabf7", marginBottom: "2rem" }}>Game Over!</h2>

      <InfoText style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        {getWinnerText()}
      </InfoText>

      <div style={{ display: "flex", gap: "1rem" }}>
        <ActionButton
          onClick={handleNewGame}
          text={
            actionState.status === "loading"
              ? "Creating new game..."
              : "New Game"
          }
          enabled={actionState.status !== "loading"}
        />

        <ActionButton
          onClick={handleBackToLobby}
          text="Back to Lobby"
          enabled={actionState.status !== "loading"}
        />
      </div>
    </Container>
  );
};
