import React, { useState } from "react";
import styled from "styled-components";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import { useGameContext, useGameplayContext } from "@frontend/game/state";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 30vw;
  margin: 0 auto;
`;

export const IntroDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleGameplayEvent, handleTurnSubmission } = useGameplayContext();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleClick = () => {
    setActionButtonEnabled(false);
    handleTurnSubmission(gameData._id, gameData.state);
    // handleGameplayEvent("next"); // Transition to the next scene
    setActionButtonEnabled(true);
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Play"
        enabled={actionButtonEnabled}
      />
    </ButtonWrapper>
  );
};

export const TransitionDashboardView: React.FC = () => {
  const { handleGameplayEvent } = useGameplayContext();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleClick = () => {
    setActionButtonEnabled(false);
    handleGameplayEvent("next"); // Trigger a "next" transition
  };

  return (
    <ButtonWrapper>
      <ActionButton
        onClick={handleClick}
        text="Continue"
        enabled={actionButtonEnabled}
      />
    </ButtonWrapper>
  );
};

export const CodemasterDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleTurnSubmission } = useGameplayContext();

  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  const handleSubmit = (updatedRounds: typeof gameData.state.rounds) => {
    const updatedGameState = { ...gameData.state, rounds: updatedRounds };
    handleTurnSubmission(gameData._id, updatedGameState);
  };

  return (
    <CodeWordInput
      isEditable={true}
      onSubmit={handleSubmit}
      codeWord={codeWord}
      numberOfCards={numberOfGuesses}
    />
  );
};

export const CodebreakerDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { handleTurnSubmission } = useGameplayContext();
  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  const handleClick = () => {
    console.log("end turn...");
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

export const GameoverDashboardView: React.FC = () => {
  const { handleGameplayEvent } = useGameplayContext();

  const handleClick = () => {
    handleGameplayEvent("restart"); // Restart the game
  };

  return (
    <ButtonWrapper>
      <ActionButton onClick={handleClick} text="Play again" />
    </ButtonWrapper>
  );
};
