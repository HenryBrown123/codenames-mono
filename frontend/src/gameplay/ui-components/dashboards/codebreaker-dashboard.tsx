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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 0.75rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
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
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--color-primary, #00ff88);
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    white-space: normal;
    overflow: visible;
  }
`;

const ClueWord = styled.span`
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  @media (min-width: 769px) and (orientation: landscape) {
    font-size: 1.3rem;
    display: block;
  }
  @media (min-width: 1025px) {
    font-size: 1.6rem;
  }
`;

const ClueNumber = styled.span`
  color: var(--color-text-muted, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  font-weight: 500;
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
            <ClueWord>"{activeTurn.clue.word}"</ClueWord>
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
