import React, { useState } from "react";
import ActionButton from "../action-button/action-button";
import CodeWordInput from "./codemaster-input";
import { useGameContext, useGameplayContext } from "@game/context";
import { useProcessTurn } from "@game/api";

export const IntroDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { mutate: processTurn, isError } = useProcessTurn();
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);

  const handleProcessTurn = () => {
    setActionButtonEnabled(false);
    processTurn({ gameId: gameData._id, gameState: gameData.state });
  };

  return (
    <>
      <ActionButton
        onClick={handleProcessTurn}
        text="Play"
        enabled={actionButtonEnabled}
      />
      {isError && <div>Something went wrong. Please try again.</div>}
    </>
  );
};

export const TransitionDashboardView: React.FC = () => {
  const [actionButtonEnabled, setActionButtonEnabled] = useState(true);
  const { dispatch } = useGameplayContext();

  const handleClick = () => {
    setActionButtonEnabled(false);
    dispatch({ type: "NEXT_SCENE" });
  };

  return (
    <ActionButton
      onClick={handleClick}
      text="Play"
      enabled={actionButtonEnabled}
    />
  );
};

export const CodemasterDashboardView: React.FC = () => {
  const { gameData } = useGameContext();
  const { mutate: processTurn } = useProcessTurn();
  const { dispatch } = useGameplayContext();

  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  const handleSubmit = (updatedRounds: typeof gameData.state.rounds) => {
    processTurn({
      gameId: gameData._id,
      gameState: { ...gameData.state, rounds: updatedRounds },
    });
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
  const latestRound = gameData.state.rounds.at(-1);
  const codeWord = latestRound?.codeword || "";
  const numberOfGuesses = latestRound?.guessesAllowed || 0;

  return (
    <CodeWordInput
      codeWord={codeWord}
      numberOfCards={numberOfGuesses}
      isEditable={false}
    />
  );
};

export const GameoverDashboardView: React.FC = () => {
  const handleClick = () => {
    console.log("New game requested"); // Reset to the intro stage
  };

  return <ActionButton onClick={handleClick} text="Play again" />;
};
