import React, { useState } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import {
  useGameActions,
  useGameplayContext,
  useUIState,
} from "@frontend/game/state";
import { Turn } from "@frontend/shared-types";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 30vw;
  margin: 0 auto;
`;

// Enhanced lobby dashboard with logging
export const LobbyDashboardView: React.FC = () => {
  const { gameData, isLoading } = useGameplayContext();
  const { handleSceneTransition } = useUIState();
  const { handleCreateRound } = useGameActions();

  const handleClick = () => {
    // join current game
    if (gameData?.currentRound && gameData?.status === "IN_PROGRESS") {
      console.log(
        "Game in progress with existing round - transitioning to gameplay",
      );
      handleSceneTransition("GAME_STARTED");
      return;
    }
    // .... or create new round
    if (!gameData?.currentRound) {
      handleCreateRound({
        onSuccess: () => {
          handleSceneTransition("GAME_STARTED");
        },
      });
      return;
    }
  };

  // Determine button text based on game state
  const getButtonText = () => {
    if (gameData?.currentRound && gameData?.status === "IN_PROGRESS") {
      return "Join Game";
    }
    return "Start Round";
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text={getButtonText()}
        enabled={!isLoading.createRound}
      />
    </ButtonWrapper>
  );
};

// Enhanced spectator dashboard with logging
export const SpectatorDashboardView: React.FC = () => {
  return (
    <ButtonWrapper>
      <div>Watching the game...</div>
    </ButtonWrapper>
  );
};

// Enhanced waiting dashboard with logging
export const WaitingDashboardView: React.FC = () => {
  const { gameData } = useGameplayContext();

  return (
    <ButtonWrapper>
      <div>Waiting for other players...</div>
    </ButtonWrapper>
  );
};

// Enhanced transition dashboard with logging
export const TransitionDashboardView: React.FC = () => {
  const {
    gameData,
    handleSceneTransition,
    handleStartRound,
    handleDealCards,
    isLoading,
  } = useGameplayContext();
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

  const { gameData, handleGiveClue, handleSceneTransition, isLoading } =
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
  const { gameData, handleSceneTransition } = useGameplayContext();

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
