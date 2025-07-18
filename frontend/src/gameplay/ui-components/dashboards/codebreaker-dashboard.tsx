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
  TerminalStatus,
  TerminalDivider,
  TerminalActions,
  TerminalOutput
} from "./terminal-components";

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
 * MOBILE-FIRST: Clue display optimized for tight mobile space
 */
const ClueDisplay = styled.div`
  /* Mobile-first: Ultra-compact clue display */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0; /* Allow shrinking */

  /* PROGRESSIVE ENHANCEMENT: Tablet landscape - back to stacked */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

/**
 * MOBILE: Single-line clue text
 */
const ClueText = styled.div`
  /* Mobile-first: One line, bold and readable */
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--color-primary, #00ff88);
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* PROGRESSIVE ENHANCEMENT: Tablet landscape - stacked layout */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    white-space: normal;
    overflow: visible;
  }
`;

const ClueWord = styled.span`
  /* Mobile: inline with quotes */
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);

  /* PROGRESSIVE ENHANCEMENT: Tablet - larger */
  @media (min-width: 769px) and (orientation: landscape) {
    font-size: 1.3rem;
    display: block;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    font-size: 1.6rem;
  }
`;

const ClueNumber = styled.span`
  /* Mobile: inline, slightly muted */
  color: var(--color-text-muted, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  font-weight: 500;

  /* PROGRESSIVE ENHANCEMENT: Tablet - separate line */
  @media (min-width: 769px) and (orientation: landscape) {
    font-size: 1rem;
    display: block;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop */
  @media (min-width: 1025px) {
    font-size: 1.1rem;
  }
`;

/**
 * MOBILE-FIRST: Compact button styling
 */
const CompactButton = styled(ActionButton)`
  /* Mobile: Override default button sizing */
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  min-height: 36px;
  flex-shrink: 0;

  /* PROGRESSIVE ENHANCEMENT: Tablet - normal size */
  @media (min-width: 769px) and (orientation: landscape) {
    padding: 0.8rem 2rem;
    font-size: 1rem;
    min-height: 44px;
    width: 100%;
  }
`;

/**
 * Codebreaker Dashboard - Compact mobile design, expanded on desktop
 */
export const CodebreakerDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
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
      {/* Mobile view stays the same */}
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

      {/* Desktop terminal view */}
      <TerminalContent className="desktop-only">
        <TerminalSection>
          <TerminalCommand>FIELD REPORT</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {activeTurn && activeTurn.clue && (
          <>
            <TerminalDivider />
            
            <TerminalSection>
              <TerminalCommand>ACTIVE INTEL</TerminalCommand>
              <TerminalStatus $type="success">
                CLUE: "{activeTurn.clue.word}" | TARGET COUNT: {activeTurn.clue.number}
              </TerminalStatus>
              <TerminalPrompt>
                <TerminalOutput>
                  Guesses remaining: {activeTurn.guessesRemaining}
                </TerminalOutput>
              </TerminalPrompt>
            </TerminalSection>
          </>
        )}

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