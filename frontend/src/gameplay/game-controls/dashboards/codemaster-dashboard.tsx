import React from "react";
import { motion } from "framer-motion";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../game-actions";
import { useTurn } from "../../game-data/providers";
import { useViewMode } from "../../game-board/view-mode/view-mode-context";
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
  CenteredContent,
  PlayerInfoLayout,
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
  const { viewMode, toggleSpymasterViewMode } = useViewMode();

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

  if (!activeTurn || activeTurn.clue !== null) {
    return (
      <>
        <div className={`${styles.container} mobile-only`} />
        <div className="desktop-only">
          <CenteredContent layoutId="dashboard-main">
            <TerminalCommand>MISSION LOG</TerminalCommand>
            <TerminalOutput>Waiting for operative turn...</TerminalOutput>
          </CenteredContent>
        </div>
      </>
    );
  }

  const handleDesktopSubmit = (word: string, count: number) => {
    giveClue(word, count);
  };

  const handleARToggle = () => {
    toggleSpymasterViewMode();
  };

  const isARMode = viewMode === "spymaster";

  return (
    <>
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

      <div className={styles.desktopContainer}>
        <TerminalSection layoutId="dashboard-main">
          <PlayerInfoLayout>
            {/* Team Symbol */}
            <motion.div
              className={styles.symbolContainer}
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {(() => {
                // Try both lowercase and capitalized versions
                const teamLower = activeTurn.teamName.toLowerCase();
                const isRed = teamLower === "red" || activeTurn.teamName === "Team Red";
                const isBlue = teamLower === "blue" || activeTurn.teamName === "Team Blue";

                const symbol = isRed ? "◇" : isBlue ? "□" : "○";
                const color = isRed ? "#ff3333" : isBlue ? "#00ddff" : "#aaaaaa";

                return (
                  <>
                    {/* Shadow depression */}
                    <div className={styles.symbolShadow}>{symbol}</div>
                    {/* Crisp LED symbol */}
                    <div
                      className={styles.symbolLED}
                      style={{
                        color: color,
                        textShadow: `0 0 8px ${color}`,
                      }}
                    >
                      {symbol}
                    </div>
                    {/* Inner glow */}
                    <div
                      className={styles.symbolGlow}
                      style={{
                        textShadow: `0 0 4px ${color}`,
                      }}
                    >
                      {symbol}
                    </div>
                  </>
                );
              })()}
            </motion.div>

            {/* Team Info */}
            <div className={styles.teamInfo}>
              <div className={styles.teamTitle}>
                <span className={styles.teamName}>{activeTurn.teamName.toUpperCase()}</span>
              </div>
              <div className={styles.teamRole}>CODEMASTER</div>
              <div className={styles.teamDivider} />
            </div>
          </PlayerInfoLayout>
        </TerminalSection>

        <MiddleSection>
          <TerminalSection layoutId="dashboard-goggles">
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

        <TerminalSection layoutId="dashboard-actions">
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
