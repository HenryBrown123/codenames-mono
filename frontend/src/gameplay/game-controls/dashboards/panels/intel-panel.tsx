import React from "react";
import { useTurn } from "../../../game-data/providers";
import {
  TerminalSection,
  TerminalCommand,
  TerminalPrompt,
  TerminalOutput,
} from "../shared";
import styles from "./intel-panel.module.css";

/**
 * Intel Panel - Active clue display for codebreakers.
 * Shows the current clue word, number, and remaining guesses.
 */
export const IntelPanel: React.FC = () => {
  const { activeTurn } = useTurn();

  const clue = activeTurn?.clue;
  const remaining = activeTurn?.guessesRemaining ?? 0;
  const label = remaining === 1 ? "attempt" : "attempts";

  return (
    <TerminalSection>
      <TerminalCommand>
        ACTIVE INTEL <span className={styles.intelPing} />
      </TerminalCommand>
      <div className={styles.intelDisplay}>
        <div className={styles.intelPrimary}>
          <div className={styles.intelMain}>
            <span className={styles.intelHighlight}>"{clue?.word}"</span>
            <span className={styles.intelGroup}>
              <span className={styles.intelConnector}>for</span>
              <span className={styles.intelHighlight}>{clue?.number}</span>
            </span>
          </div>
        </div>

        <div className={styles.intelSecondary}>
          <TerminalPrompt>
            <TerminalOutput>
              {remaining} {label} left
            </TerminalOutput>
          </TerminalPrompt>
        </div>
      </div>
    </TerminalSection>
  );
};
