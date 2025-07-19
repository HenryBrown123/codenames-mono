import React from "react";
import styled from "styled-components";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { ActionButton } from "../../shared/components";
import {
  TerminalContent,
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalDivider,
  TerminalActions,
  TerminalOutput,
  TerminalMessageBlock, // <-- import the new block
} from "./terminal-components";

const Container = styled.div`
  /* Mobile-first: Vertical stack for bigger dashboard */
  display: flex;
  flex-direction: column; /* CHANGED from row */
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem; /* CHANGED from 0.5rem */
  gap: 1rem; /* CHANGED from 0.75rem */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
  }
  @media (min-width: 1025px) {
    gap: 2rem;
    padding: 1.5rem;
  }
`;

const ClueDisplay = styled.div`
  /* Mobile-first: Prominent clue display */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 136, 0.2);
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  @media (min-width: 1025px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const ClueText = styled.div`
  /* Mobile-first: BIGGER, clearer text */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  color: var(--color-primary, #00ff88);
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    white-space: normal;
    overflow: visible;
  }
`;

const ClueWord = styled.span`
  /* Mobile: BIG and prominent */
  font-size: 1.5rem; /* CHANGED from 1rem */
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;

  /* Add quotes for clarity */
  &::before {
    content: '"';
    opacity: 0.7;
  }
  &::after {
    content: '"';
    opacity: 0.7;
  }
  @media (min-width: 769px) and (orientation: landscape) {
    font-size: 1.3rem;
    display: block;
  }
  @media (min-width: 1025px) {
    font-size: 1.6rem;
  }
`;

const ClueNumber = styled.span`
  /* Mobile: Clear but secondary */
  color: var(--color-text, white);
  font-size: 1.1rem; /* CHANGED from 0.9rem */
  font-weight: 500;
  opacity: 0.9;
  @media (min-width: 769px) and (orientation: landscape) {
    font-size: 1rem;
    display: block;
  }
  @media (min-width: 1025px) {
    font-size: 1.1rem;
  }
`;

const CompactButton = styled(ActionButton)`
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  min-height: 36px;
  flex-shrink: 0;
  @media (min-width: 769px) and (orientation: landscape) {
    padding: 0.8rem 2rem;
    font-size: 1rem;
    min-height: 44px;
    width: 100%;
  }
`;

export const CodebreakerDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();
  const { activeTurn } = useTurn();
  const { endTurn, actionState } = useGameActions();

  const canEndTurn = React.useMemo(() => {
    if (!activeTurn || !activeTurn.clue) return false;
    if (gameData.playerContext?.teamName !== activeTurn.teamName) return false;
    return activeTurn.guessesRemaining > 0;
  }, [activeTurn, gameData.playerContext]);

  if (!activeTurn || activeTurn.clue === null) {
    return (
      <>
        <Container className="mobile-only" />
        <TerminalContent className="desktop-only">
          <TerminalSection>
            <TerminalCommand>FIELD REPORT</TerminalCommand>
            <TerminalPrompt>
              <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
            </TerminalPrompt>
          </TerminalSection>
        </TerminalContent>
      </>
    );
  }

  return (
    <>
      {/* MOBILE */}
      <Container className="mobile-only">
        <ClueDisplay>
          <ClueText>
            <ClueWord>{activeTurn.clue.word}</ClueWord>
            <ClueNumber>for {activeTurn.clue.number}</ClueNumber>
          </ClueText>
        </ClueDisplay>
        <CompactButton
          onClick={endTurn}
          text={actionState.status === "loading" ? "..." : "End Turn"}
          enabled={(canEndTurn && actionState.status !== "loading") || false}
        />
      </Container>

      {/* DESKTOP TERMINAL */}
      <TerminalContent className="desktop-only">
        <TerminalSection>
          <TerminalCommand>FIELD REPORT</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        <TerminalDivider />

        <TerminalSection>
          <TerminalCommand>ACTIVE INTEL</TerminalCommand>
          <TerminalMessageBlock>
            {`CLUE: "${activeTurn.clue.word}"
              TARGET COUNT: ${activeTurn.clue.number}`}
          </TerminalMessageBlock>
          <TerminalPrompt>
            <TerminalOutput>Guesses remaining: {activeTurn.guessesRemaining}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {canEndTurn && (
          <TerminalActions>
            <ActionButton
              onClick={endTurn}
              text={actionState.status === "loading" ? "PROCESSING..." : "END TRANSMISSION"}
              enabled={actionState.status !== "loading"}
            />
          </TerminalActions>
        )}
      </TerminalContent>
    </>
  );
};
