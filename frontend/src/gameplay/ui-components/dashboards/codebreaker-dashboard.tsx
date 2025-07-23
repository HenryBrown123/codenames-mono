import React from "react";
import styled, { keyframes } from "styled-components";
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

  /* Hide on mobile */
  @media (max-width: 768px) {
    display: none;
  }
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
  gap: 1rem;
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

const IntelPrimary = styled.div`
  background: linear-gradient(120deg, rgba(255, 177, 0, 0.14) 0%, rgba(60, 60, 50, 0.16) 80%);
  border: 2px solid #ffb100;
  border-radius: 8px;
  padding: 20px 15px 12px 15px;
  box-shadow:
    0 0 15px 0 rgba(255, 177, 0, 0.3),
    0 0 0 1px rgba(0, 255, 136, 0.5) inset;
  position: relative;
  margin-bottom: 1rem;
`;

const IntelHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const IntelBadge = styled.span`
  font-size: 0.96em;
  color: #ffb100;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(255, 177, 0, 0.5);
`;

const pingGlow = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0.13;
  }
`;

const IntelPing = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 9px;
  border-radius: 50%;
  background: #ffb100;
  box-shadow: 0 0 8px 2px rgba(255, 177, 0, 0.5);
  animation: ${pingGlow} 1.3s infinite;
`;

const IntelMain = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
`;

const IntelTag = styled.span`
  color: #ffb100;
  font-weight: bold;
  letter-spacing: 1px;
  text-shadow: 0 0 4px rgba(255, 177, 0, 0.5);
`;

const IntelHighlight = styled.span`
  color: #fff;
  background: rgba(255, 177, 0, 0.3);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 1.2px;
  box-shadow: 0 0 6px rgba(255, 177, 0, 0.5);
`;

const IntelSecondary = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  padding: 0.5rem 0;
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
        <DesktopContainer>
          <TerminalSection>
            <TerminalCommand>FIELD REPORT</TerminalCommand>
            <TerminalPrompt>
              <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
            </TerminalPrompt>
          </TerminalSection>
        </DesktopContainer>
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
      <DesktopContainer>
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
              <IntelPrimary>
                <IntelHeader>
                  <IntelBadge>[ INCOMING INTEL ]</IntelBadge>
                  <IntelPing />
                </IntelHeader>
                <IntelMain>
                  <IntelTag>CODEWORD:</IntelTag>
                  <IntelHighlight>"{activeTurn.clue.word}"</IntelHighlight>
                  <span style={{ color: "#ffb100" }}>//</span>
                  <IntelTag>TARGET:</IntelTag>
                  <IntelHighlight>{activeTurn.clue.number}</IntelHighlight>
                </IntelMain>
              </IntelPrimary>

              <IntelSecondary>
                <IntelRow>
                  <IntelLabel>REMAINING:</IntelLabel>
                  <span style={{ color: "#fff" }}>{activeTurn.guessesRemaining} attempts</span>
                </IntelRow>
              </IntelSecondary>
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
      </DesktopContainer>
    </>
  );
};
