import React from "react";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useGameActions } from "../../game-actions";
import { ActionButton } from "../../shared/components";
import {
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalOutput,
  TerminalMessageBlock,
  CenteredContent,
} from "./terminal-components";
import { AiStatusIndicator } from "@frontend/ai/components";
import sharedStyles from "./shared-dashboard.module.css";
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
        <div className={`${sharedStyles.dashboardContainer} mobile-only`} />
        <div className={sharedStyles.desktopContainer}>
          <CenteredContent layoutId="dashboard-main">
            <TerminalCommand>FIELD REPORT</TerminalCommand>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </CenteredContent>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile view - Grid layout matching Codemaster */}
      <div className={`${sharedStyles.dashboardContainer} ${styles.codebreakerGrid} mobile-only`}>
        {/* Top: Clue display */}
        <div className={sharedStyles.infoDisplay}>
          <div className={sharedStyles.dashboardTitle}>"{activeTurn.clue.word}"</div>
          <div className={sharedStyles.dashboardSubtitle}>for {activeTurn.clue.number}</div>
          {activeTurn.guessesRemaining > 0 && (
            <div className={`${sharedStyles.dashboardText} ${styles.remainingGuesses}`}>
              {activeTurn.guessesRemaining} {activeTurn.guessesRemaining === 1 ? 'guess' : 'guesses'} left
            </div>
          )}
        </div>
        
        {/* Bottom: Actions */}
        <div className={sharedStyles.dashboardSection}>
          <div className={sharedStyles.actionSingle}>
            <button
              className={canEndTurn ? sharedStyles.primaryAction : sharedStyles.secondaryAction}
              onClick={endTurn}
              disabled={!canEndTurn || actionState.status === "loading"}
            >
              {actionState.status === "loading" ? "ENDING..." : "END TURN"}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className={sharedStyles.desktopContainer}>
        <TerminalSection layoutId="dashboard-main">
          <TerminalCommand>FIELD REPORT</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Standing by..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

{activeTurn?.clue && (
          <TerminalSection layoutId="dashboard-intel">
            <TerminalCommand>
              ACTIVE INTEL <span className={styles.intelPing} />
            </TerminalCommand>
            <div className={styles.intelDisplay}>
              <div className={styles.intelPrimary}>
                <div className={styles.intelMain}>
                  <span className={styles.intelHighlight}>"{activeTurn.clue.word}"</span>
                  <span className={styles.intelGroup}>
                    <span className={styles.intelConnector}>for</span>
                    <span className={styles.intelHighlight}>{activeTurn.clue.number}</span>
                  </span>
                </div>
              </div>

              <div className={styles.intelSecondary}>
                <TerminalPrompt>
                  <TerminalOutput>{activeTurn.guessesRemaining} {activeTurn.guessesRemaining === 1 ? 'attempt' : 'attempts'} left</TerminalOutput>
                </TerminalPrompt>
              </div>
            </div>
          </TerminalSection>
        )}

        <TerminalSection layoutId="codebreaker-ai-status">
          <TerminalCommand>AI ASSISTANT</TerminalCommand>
          <AiStatusIndicator gameId={gameData.publicId} />
        </TerminalSection>

        {canEndTurn && (
          <TerminalSection layoutId="dashboard-actions">
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
