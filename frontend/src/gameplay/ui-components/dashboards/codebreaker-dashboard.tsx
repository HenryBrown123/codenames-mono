import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 1.5rem;
`;

const ClueDisplay = styled.div`
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  
  h4 {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    margin: 0;
    font-family: "JetBrains Mono", "Courier New", monospace;
  }
  
  .clue-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #00ff88;
    text-shadow: 0 0 20px #00ff88;
    font-family: "JetBrains Mono", "Courier New", monospace;
  }
`;

const StyledButton = styled.button`
  padding: 1rem 1.5rem;
  border: 1px solid #00ff88;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 250ms ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "JetBrains Mono", "Courier New", monospace;
  background-color: transparent;
  width: 100%;
  color: #00ff88;
  text-align: center;
  
  &:hover {
    background-color: #00ff88;
    color: #000;
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
      color: #00ff88;
      box-shadow: none;
    }
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
      <ClueDisplay>
        <h4>Current Intel</h4>
        <CodeWordInput
          codeWord={activeTurn.clue.word}
          numberOfCards={activeTurn.clue.number}
          isEditable={false}
          isLoading={false}
        />
      </ClueDisplay>
      <StyledButton
        onClick={endTurn}
        disabled={!canEndTurn || actionState.status === "loading"}
      >
        {actionState.status === "loading" ? "Ending Turn..." : "End Turn"}
      </StyledButton>
    </Container>
  );
};
