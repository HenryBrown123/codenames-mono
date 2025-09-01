import React from "react";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../game-actions";
import { useTurn } from "../../game-data/providers";
import { useCardVisibilityStore } from "../../game-board/cards/card-visibility-store";
import {
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalOutput,
  SpyGogglesContainer,
  SpyGogglesText,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
  SpySwitch,
  SpySlider,
  SpyStatus,
  MiddleSection,
} from "./terminal-components";
import styles from "./codemaster-dashboard.module.css";

interface CodemasterDashboardProps {
  onOpenCluePanel?: () => void;
  messageText?: string;
}

/**
 * Codemaster Dashboard - AR toggle + clue transmission
 */
export const CodemasterDashboard: React.FC<CodemasterDashboardProps> = ({
  onOpenCluePanel,
  messageText,
}) => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const viewMode = useCardVisibilityStore((state) => state.viewMode);
  const toggleSpymasterView = useCardVisibilityStore((state) => state.toggleSpymasterView);

  // Add keyboard shortcut for power users
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+A or Cmd+A toggles AR
      if ((e.altKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handleARToggle();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Don't show anything if not the codemaster's turn
  if (!activeTurn || activeTurn.clue !== null) {
    return (
      <>
        <div className={`${styles.container} mobile-only`} />
        <div className="desktop-only">
          <TerminalSection>
            <TerminalCommand>MISSION LOG</TerminalCommand>
            <TerminalPrompt>
              <TerminalOutput>Waiting for operative turn...</TerminalOutput>
            </TerminalPrompt>
          </TerminalSection>
        </div>
      </>
    );
  }

  const handleDesktopSubmit = (word: string, count: number) => {
    giveClue(word, count);
  };

  const handleARToggle = () => {
    toggleSpymasterView();
  };

  const isARMode = viewMode === "spymaster";

  return (
    <>
      {/* Mobile view - NEW GRID LAYOUT */}
      <div className={`${styles.container} mobile-only`}>
        <div className={styles.mobileToggleContainer}>
          <span className={styles.toggleLabel}>Spymaster Vision</span>
          <label className={styles.toggleSwitch}>
            <input type="checkbox" checked={isARMode} onChange={handleARToggle} />
            <span className={styles.toggleTrack}>
              <span className={styles.toggleThumb} />
            </span>
          </label>
        </div>

        <div className={styles.transmitSection}>
          <button
            className={styles.transmitButton}
            onClick={onOpenCluePanel || (() => {})}
            disabled={actionState.status === "loading"}
          >
            {actionState.status === "loading" ? "TRANSMITTING..." : "TRANSMIT CLUE"}
          </button>
        </div>
      </div>

      {/* Desktop terminal view - unchanged */}
      <div className={styles.desktopContainer}>
        {/* TOP - Instructions */}
        <TerminalSection>
          <TerminalCommand>MISSION LOG</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Awaiting orders..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        {/* MIDDLE - Intel (Spy Goggles) - wrapped to expand */}
        <MiddleSection>
          <TerminalSection>
            <TerminalCommand>SPY GOGGLES</TerminalCommand>
            <SpyGogglesContainer>
              <SpyGogglesText>Toggle enhanced vision</SpyGogglesText>
              <SpyGogglesSwitchRow>
                <SpyGogglesDot active={isARMode} />
                <SpySwitch>
                  <input type="checkbox" checked={isARMode} onChange={handleARToggle} />
                  <SpySlider />
                </SpySwitch>
                <SpyStatus active={isARMode}>{isARMode ? "ON" : "OFF"}</SpyStatus>
              </SpyGogglesSwitchRow>
            </SpyGogglesContainer>
          </TerminalSection>
        </MiddleSection>

        {/* BOTTOM - Action */}
        <TerminalSection>
          <TerminalCommand>ACTION</TerminalCommand>
          <CodeWordInput
            codeWord=""
            numberOfCards={null}
            isEditable={true}
            isLoading={actionState.status === "loading"}
            onSubmit={handleDesktopSubmit}
          />
        </TerminalSection>
      </div>
    </>
  );
};
