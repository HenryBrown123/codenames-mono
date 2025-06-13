// frontend/src/features/gameplay/ui/dashboard/dashboard-views.tsx
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

// New dashboard for lobby/game setup
export const LobbyDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleCreateRound, isLoading } = useGameplayContext();

  const handleClick = () => {
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

// New dashboard for spectators
export const SpectatorDashboardView: React.FC = () => {
  return (
    <ButtonWrapper>
      <div>Watching the game...</div>
    </ButtonWrapper>
  );
};

// Dashboard for waiting states
export const WaitingDashboardView: React.FC = () => {
  const { gameData } = useGameContext();

  return (
    <ButtonWrapper>
      <div>Waiting for other players...</div>
    </ButtonWrapper>
  );
};

// Updated transition dashboard with scene transitions
export const TransitionDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const {
    handleSceneTransition,
    handleStartRound,
    handleDealCards,
    isLoading,
  } = useGameplayContext();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleClick = () => {
    if (!gameData.currentRound) {
      // If no round, just transition UI
      handleSceneTransition("next");
      return;
    }

    setActionButtonEnabled(false);

    // If round needs cards, deal them first
    if (
      !gameData.currentRound.cards ||
      gameData.currentRound.cards.length === 0
    ) {
      handleDealCards(gameData.currentRound.roundNumber.toString());
    } else if (gameData.currentRound.status === "SETUP") {
      // If round needs to be started
      handleStartRound(gameData.currentRound.roundNumber);
    } else {
      // Otherwise just transition UI scene
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

// Updated codemaster dashboard with scene transitions
export const CodemasterDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleGiveClue, handleSceneTransition, isLoading } =
    useGameplayContext();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );
  const codeWord = activeTurn?.clue?.word || "";
  const numberOfGuesses = activeTurn?.clue?.number || 0;

  const handleSubmit = (word: string, targetCardCount: number) => {
    if (!currentRound) return;

    // Give the clue
    handleGiveClue(currentRound.roundNumber, word, targetCardCount);

    // Manually trigger UI transition to waiting state
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

// Updated codebreaker dashboard with scene transitions
export const CodebreakerDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleSceneTransition } = useGameplayContext();

  const currentRound = gameData.currentRound;
  const activeTurn = currentRound?.turns?.find(
    (t: Turn) => t.status === "ACTIVE",
  );
  const codeWord = activeTurn?.clue?.word || "";
  const numberOfGuesses = activeTurn?.clue?.number || 0;

  const handleClick = () => {
    // Trigger scene transition to end turn
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

// Updated gameover dashboard
export const GameoverDashboardView: React.FC = () => {
  const { handleCreateRound, isLoading } = useGameplayContext();

  const handleClick = () => {
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
