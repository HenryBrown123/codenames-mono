import React from "react";
import styled from "styled-components";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { ActionButton } from "../../shared/components";
import {
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalOutput,
  TerminalMessageBlock,
} from "./terminal-components";

/**
 * Mobile container - simple horizontal layout
 */
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 0.75rem;
`;

const DesktopContainer = styled.div`
  display: contents;
`;

/**
 * Mobile clue display
 */
const ClueDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
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
`;

const ClueWord = styled.span`
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
`;

const ClueNumber = styled.span`
  color: var(--color-text-muted, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  font-weight: 500;
`;

/**
 * Compact button for mobile
 */
const CompactButton = styled(ActionButton)`
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  min-height: 36px;
  flex-shrink: 0;
`;

/**
 * Intel display for desktop - styled like terminal output
 */
const IntelDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const IntelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: "JetBrains Mono", monospace;
`;

const IntelLabel = styled.span`
  color: var(--color-primary, #00ff88);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  min-width: 100px;
`;

const IntelValue = styled.span`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
`;

/**
 * Codebreaker Dashboard - Shows clue and allows ending turn
 */
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
        <div className="desktop-only">
          <TerminalSection>
            <TerminalCommand>FIELD REPORT</TerminalCommand>
            <TerminalPrompt>
              <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
            </TerminalPrompt>
          </TerminalSection>
        </div>
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
      <div className="desktop-only">
        <TerminalSection>
          <TerminalCommand>FIELD REPORT</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {activeTurn?.clue && (
          <TerminalSection>
            <TerminalCommand>ACTIVE INTEL</TerminalCommand>
            <IntelDisplay>
              <IntelRow>
                <IntelLabel>CODEWORD:</IntelLabel>
                <IntelValue>"{activeTurn.clue.word}"</IntelValue>
              </IntelRow>
              <IntelRow>
                <IntelLabel>TARGET:</IntelLabel>
                <IntelValue>{activeTurn.clue.number} assets</IntelValue>
              </IntelRow>
              <IntelRow>
                <IntelLabel>REMAINING:</IntelLabel>
                <IntelValue>{activeTurn.guessesRemaining} attempts</IntelValue>
              </IntelRow>
            </IntelDisplay>
          </TerminalSection>
        )}

        {canEndTurn && (
          <TerminalSection>
            <ActionButton
              onClick={endTurn}
              text={actionState.status === "loading" ? "PROCESSING..." : "END TRANSMISSION"}
              enabled={actionState.status !== "loading"}
            />
          </TerminalSection>
        )}
      </div>
    </>
  );
};
