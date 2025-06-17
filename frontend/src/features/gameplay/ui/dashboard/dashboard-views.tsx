import React, { useState } from "react";
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

// Lobby dashboard
export const LobbyDashboardView: React.FC = () => {
  console.log("Rendering LobbyDashboardView");

  const { gameData } = useGameData();
  const { handleSceneTransition } = useUIScene();
  const { createRound, actionState } = useGameActions();

  console.log("Lobby Dashboard State:", {
    gameStatus: gameData?.status,
    isLoading: actionState.status === "loading",
    hasCurrentRound: !!gameData?.currentRound,
    playerRole: gameData?.playerContext?.role,
  });

  const handleClick = () => {
    // If game already has a round but player has no role, try to transition
    if (gameData?.currentRound && gameData?.status === "IN_PROGRESS") {
      console.log(
        "Game in progress with existing round - transitioning to gameplay",
      );
      handleSceneTransition("next");
      return;
    }

    // Only create round if there isn't one
    if (!gameData?.currentRound) {
      console.log("Lobby: Creating new round");
      createRound();
    } else {
      console.log("Round already exists, not creating another");
    }
  };

  // Determine button text based on game state
  const getButtonText = () => {
    if (gameData?.currentRound && gameData?.status === "IN_PROGRESS") {
      return "Join Game";
    }
    return "Start Game";
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text={getButtonText()}
        enabled={actionState.status !== "loading"}
      />
    </ButtonWrapper>
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
  const { gameData } = useGameData();

  return (
    <Container>
      <InfoText>Waiting for the other team...</InfoText>
    </Container>
  );
};

// Transition dashboard
export const TransitionDashboardView: React.FC = () => {
  const { gameData } = useGameData();
  const { handleSceneTransition } = useUIScene();
  const { startRound, dealCards, actionState } = useGameActions();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleClick = () => {
    console.log("Transition: Continue clicked");

    if (!gameData.currentRound) {
      console.log("No round - triggering scene transition");
      handleSceneTransition("next");
      return;
    }

    setActionButtonEnabled(false);

    // If round needs cards, deal them first
    if (
      !gameData.currentRound.cards ||
      gameData.currentRound.cards.length === 0
    ) {
      console.log(
        "Dealing cards for round:",
        gameData.currentRound.roundNumber,
      );
      dealCards();
    } else if (gameData.currentRound.status === "SETUP") {
      console.log("Starting round:", gameData.currentRound.roundNumber);
      startRound();
    } else {
      console.log("Transitioning to next scene");
      handleSceneTransition("next");
    }

    setActionButtonEnabled(true);
  };

  const isLoading = actionState.status === "loading";

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Continue"
        enabled={actionButtonEnabled && !isLoading}
      />
    </ButtonWrapper>
  );
};

// Codemaster dashboard
export const CodemasterDashboardView: React.FC = () => {
  console.log("Rendering CodemasterDashboardView");

  const { gameData } = useGameData();
  const { giveClue, actionState } = useGameActions();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );
  const codeWord = activeTurn?.clue?.word || "";
  const numberOfGuesses = activeTurn?.clue?.number || 0;

  console.log("Codemaster Dashboard State:", {
    currentRound: currentRound?.roundNumber,
    activeTurn: !!activeTurn,
    hasClue: !!activeTurn?.clue,
  });

  const handleSubmitClue = (word: string, count: number) => {
    console.log("Submitting clue:", { word, count });
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
  console.log("Rendering CodebreakerDashboardView");

  const { gameData } = useGameData();
  const { endTurn, actionState } = useGameActions();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );

  console.log("Codebreaker Dashboard State:", {
    currentRound: currentRound?.roundNumber,
    activeTurn: !!activeTurn,
    guessesRemaining: activeTurn?.guessesRemaining,
  });

  const handleEndTurn = () => {
    console.log("Ending turn");
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

  // Get winner information - you might need to adjust this based on your actual data structure
  const getWinnerText = () => {
    // Check if there's a winner in the current round or game data
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
