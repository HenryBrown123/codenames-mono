import React from "react";
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
import styles from "./codebreaker-dashboard.module.css";


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
        <div className={`${styles.container} mobile-only`} />
        <div className={styles.desktopContainer}>
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
      <div className={`${styles.container} mobile-only`}>
        <div className={styles.clueDisplay}>
          <div className={styles.clueText}>
            <span className={styles.clueWord}>"{activeTurn.clue.word}"</span>
            <span className={styles.clueNumber}>for {activeTurn.clue.number}</span>
          </div>
        </div>
        <ActionButton
          className={styles.compactButton}
          onClick={endTurn}
          text={actionState.status === "loading" ? "..." : "End Turn"}
          enabled={(canEndTurn && actionState.status !== "loading") || false}
        />
      </div>

      {/* DESKTOP TERMINAL */}
      <div className={styles.desktopContainer}>
        <TerminalSection>
          <TerminalCommand>FIELD REPORT</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {activeTurn?.clue && (
          <TerminalSection>
            <TerminalCommand>ACTIVE INTEL</TerminalCommand>
            <div className={styles.intelDisplay}>
              <div className={styles.intelPrimary}>
                <div className={styles.intelHeader}>
                  <span className={styles.intelBadge}>[ INCOMING INTEL ]</span>
                  <span className={styles.intelPing} />
                </div>
                <div className={styles.intelMain}>
                  <span className={styles.intelTag}>CODEWORD:</span>
                  <span className={styles.intelHighlight}>"{activeTurn.clue.word}"</span>
                  <span className={styles.separator}>//</span>
                  <span className={styles.intelTag}>TARGET:</span>
                  <span className={styles.intelHighlight}>{activeTurn.clue.number}</span>
                </div>
              </div>

              <div className={styles.intelSecondary}>
                <div className={styles.intelRow}>
                  <span className={styles.intelLabel}>REMAINING:</span>
                  <span style={{ color: "#fff" }}>{activeTurn.guessesRemaining} attempts</span>
                </div>
              </div>
            </div>
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
