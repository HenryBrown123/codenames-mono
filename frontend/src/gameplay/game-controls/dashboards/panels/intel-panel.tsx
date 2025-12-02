import React from "react";
import { useTurn } from "../../../game-data/providers";
import {
  TerminalSection,
  TerminalCommand,
  TerminalPrompt,
  TerminalOutput,
} from "../shared";
import styles from "./intel-panel.module.css";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface IntelPanelViewProps {
  clueWord?: string;
  clueNumber?: number;
  guessesRemaining: number;
}

export const IntelPanelView: React.FC<IntelPanelViewProps> = ({
  clueWord,
  clueNumber,
  guessesRemaining,
}) => {
  const label = guessesRemaining === 1 ? "attempt" : "attempts";

  return (
    <TerminalSection>
      <TerminalCommand>
        ACTIVE INTEL <span className={styles.intelPing} />
      </TerminalCommand>
      <div className={styles.intelDisplay}>
        <div className={styles.intelPrimary}>
          <div className={styles.intelMain}>
            <span className={styles.intelHighlight}>"{clueWord}"</span>
            <span className={styles.intelGroup}>
              <span className={styles.intelConnector}>for</span>
              <span className={styles.intelHighlight}>{clueNumber}</span>
            </span>
          </div>
        </div>

        <div className={styles.intelSecondary}>
          <TerminalPrompt>
            <TerminalOutput>
              {guessesRemaining} {label} left
            </TerminalOutput>
          </TerminalPrompt>
        </div>
      </div>
    </TerminalSection>
  );
};

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const IntelPanel: React.FC = () => {
  const { activeTurn } = useTurn();

  return (
    <IntelPanelView
      clueWord={activeTurn?.clue?.word}
      clueNumber={activeTurn?.clue?.number}
      guessesRemaining={activeTurn?.guessesRemaining ?? 0}
    />
  );
};
