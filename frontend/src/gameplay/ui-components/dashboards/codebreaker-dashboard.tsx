import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { ActionButton } from "../../shared/components";

/**
 * MOBILE-FIRST: Dashboard container that adapts to layout context
 */
const Container = styled.div`
  /* Mobile-first: Horizontal layout, compact */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 0.75rem;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - vertical in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - more space */
  @media (min-width: 1025px) {
    gap: 2rem;
    padding: 1.5rem;
  }
`;

/**
 * MOBILE-FIRST: Clue display optimized for mobile
 */
const ClueDisplay = styled.div`
  /* Mobile-first: Compact clue display */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  min-width: 0; /* Allow shrinking */

  /* PROGRESSIVE ENHANCEMENT: Tablet */
  @media (min-width: 481px) {
    padding: 0.75rem;
    border-radius: 12px;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const ClueWord = styled.div`
  /* Mobile-first: Readable clue text */
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary, #00ff88);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  margin-bottom: 0.25rem;

  /* PROGRESSIVE ENHANCEMENT: Tablet */
  @media (min-width: 481px) {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    font-size: 1.6rem;
  }
`;

const ClueNumber = styled.div`
  /* Mobile-first: Clear number display */
  font-size: 0.9rem;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.7));
  font-weight: 500;

  /* PROGRESSIVE ENHANCEMENT: Tablet */
  @media (min-width: 481px) {
    font-size: 1rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    font-size: 1.1rem;
  }
`;

/**
 * MOBILE-FIRST: Button container for end turn action
 */
const ButtonContainer = styled.div`
  /* Mobile-first: Compact button area */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* PROGRESSIVE ENHANCEMENT: Sidebar layout - full width button */
  @media (min-width: 769px) and (orientation: landscape) {
    width: 100%;
  }
`;

/**
 * Codebreaker Dashboard - Shows clue and end turn option
 */
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
        <ClueWord>"{activeTurn.clue.word}"</ClueWord>
        <ClueNumber>for {activeTurn.clue.number} cards</ClueNumber>
      </ClueDisplay>

      <ButtonContainer>
        <ActionButton
          onClick={endTurn}
          text={actionState.status === "loading" ? "Ending..." : "End Turn"}
          enabled={(canEndTurn && actionState.status !== "loading") || false}
        />
      </ButtonContainer>
    </Container>
  );
};
