import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { ActionButton } from "../../shared/components";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 1rem;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
`;


export const CodebreakerDashboard: React.FC = () => {
  const { gameData } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { endTurn, actionState } = useGameActions();

  /**
   * Rules for when a turn can be ended.
   */
  const canEndTurn = React.useMemo(() => {
    // Must have an active turn with a clue
    if (!activeTurn || !activeTurn.clue) return false;

    // Must be the player's team's turn
    if (gameData.playerContext?.teamName !== activeTurn.teamName) return false;

    // Must have guesses remaining to end early
    return activeTurn.guessesRemaining > 0;
  }, [activeTurn, gameData.playerContext]);

  if (!activeTurn || activeTurn.clue === null) {
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
      <ActionButton
        onClick={endTurn}
        text={actionState.status === "loading" ? "Ending Turn..." : "End Turn"}
        enabled={(canEndTurn && actionState.status !== "loading") || false}
      />
    </Container>
  );
};
