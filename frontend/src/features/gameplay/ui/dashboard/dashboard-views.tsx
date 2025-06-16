import React, { useState } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import { useGameContext, useGameplayContext } from "@frontend/game/state";
import { Turn } from "@frontend/shared-types";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 30vw;
  margin: 0 auto;
`;

// Enhanced lobby dashboard with logging
export const LobbyDashboardView: React.FC = () => {
  console.log("Rendering LobbyDashboardView");

  const { gameData } = useGameContext();
  const { handleCreateRound, isLoading } = useGameplayContext();

  console.log("Lobby Dashboard State:", {
    gameStatus: gameData?.status,
    isLoading: isLoading.createRound,
    hasCurrentRound: !!gameData?.currentRound,
  });

  const handleClick = () => {
    console.log("Lobby: Start Game clicked");
    handleCreateRound();
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Start Game"
        enabled={!isLoading.createRound}
      />
    </ButtonWrapper>
  );
};

// Enhanced spectator dashboard with logging
export const SpectatorDashboardView: React.FC = () => {
  console.log("Rendering SpectatorDashboardView");

  return (
    <ButtonWrapper>
      <div>Watching the game...</div>
    </ButtonWrapper>
  );
};

// Enhanced waiting dashboard with logging
export const WaitingDashboardView: React.FC = () => {
  console.log("Rendering WaitingDashboardView");

  const { gameData } = useGameContext();

  console.log("Waiting Dashboard State:", {
    gameStatus: gameData?.status,
    currentRound: gameData?.currentRound?.roundNumber,
    playerRole: gameData?.playerContext?.role,
  });

  return (
    <ButtonWrapper>
      <div>Waiting for other players...</div>
    </ButtonWrapper>
  );
};

// Enhanced transition dashboard with logging
export const TransitionDashboardView: React.FC = () => {
  console.log("Rendering TransitionDashboardView");

  const { gameData } = useGameContext();
  const {
    handleSceneTransition,
    handleStartRound,
    handleDealCards,
    isLoading,
  } = useGameplayContext();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  console.log("Transition Dashboard State:", {
    hasCurrentRound: !!gameData.currentRound,
    roundNumber: gameData.currentRound?.roundNumber,
    roundStatus: gameData.currentRound?.status,
    cardCount: gameData.currentRound?.cards?.length,
    isLoading: isLoading,
  });

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
      handleDealCards(gameData.currentRound.roundNumber.toString());
    } else if (gameData.currentRound.status === "SETUP") {
      console.log("Starting round:", gameData.currentRound.roundNumber);
      handleStartRound(gameData.currentRound.roundNumber);
    } else {
      console.log("Transitioning to next scene");
      handleSceneTransition("next");
    }

    setActionButtonEnabled(true);
  };

  const isLoading_ = isLoading.startRound || isLoading.dealCards;

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Continue"
        enabled={actionButtonEnabled && !isLoading_}
      />
    </ButtonWrapper>
  );
};

// Enhanced codemaster dashboard with logging
export const CodemasterDashboardView: React.FC = () => {
  console.log("Rendering CodemasterDashboardView");

  const { gameData } = useGameContext();
  const { handleGiveClue, handleSceneTransition, isLoading } =
    useGameplayContext();

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
    codeWord,
    numberOfGuesses,
    isLoading: isLoading.giveClue,
  });

  const handleSubmit = (word: string, targetCardCount: number) => {
    console.log("Codemaster: Submitting clue", { word, targetCardCount });

    if (!currentRound) {
      console.error("No current round available");
      return;
    }

    // Give the clue
    handleGiveClue(currentRound.roundNumber, word, targetCardCount);

    // Manually trigger UI transition to waiting state
    console.log("Triggering scene transition: CLUE_SUBMITTED");
    handleSceneTransition("CLUE_SUBMITTED");
  };

  return (
    <CodeWordInput
      isEditable={true}
      onSubmit={handleSubmit}
      codeWord={codeWord}
      numberOfCards={numberOfGuesses}
      isLoading={isLoading.giveClue}
    />
  );
};

// Enhanced codebreaker dashboard with logging
export const CodebreakerDashboardView: React.FC = () => {
  console.log("Rendering CodebreakerDashboardView");

  const { gameData } = useGameContext();
  const { handleSceneTransition } = useGameplayContext();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );
  const codeWord = activeTurn?.clue?.word || "";
  const numberOfGuesses = activeTurn?.clue?.number || 0;

  console.log("Codebreaker Dashboard State:", {
    currentRound: currentRound?.roundNumber,
    activeTurn: !!activeTurn,
    hasClue: !!activeTurn?.clue,
    codeWord,
    numberOfGuesses,
  });

  const handleClick = () => {
    console.log("Codebreaker: End Turn clicked");
    console.log("Triggering scene transition: TURN_ENDED");
    handleSceneTransition("TURN_ENDED");
  };

  return (
    <>
      <CodeWordInput
        codeWord={codeWord}
        numberOfCards={numberOfGuesses}
        isEditable={false}
      />
      <ButtonWrapper>
        <ActionButton onClick={handleClick} text="End Turn" />
      </ButtonWrapper>
    </>
  );
};

// Enhanced gameover dashboard with logging
export const GameoverDashboardView: React.FC = () => {
  console.log("Rendering GameoverDashboardView");

  const { handleCreateRound, isLoading } = useGameplayContext();

  console.log("Gameover Dashboard State:", {
    isLoading: isLoading.createRound,
  });

  const handleClick = () => {
    console.log("Gameover: Play again clicked");
    handleCreateRound(); // Start a new round/game
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Play again"
        enabled={!isLoading.createRound}
      />
    </ButtonWrapper>
  );
};
