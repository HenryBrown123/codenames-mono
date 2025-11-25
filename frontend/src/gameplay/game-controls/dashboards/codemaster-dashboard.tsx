import React from "react";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../game-actions";
import { useGameDataRequired, useTurn } from "../../game-data/providers";
import { useViewMode } from "../../game-board/view-mode/view-mode-context";
import { TeamSymbolHeader } from "./team-symbol-header";
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
} from "./terminal-components";
import { AiStatusIndicator } from "@frontend/ai/components";

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
  const { gameData } = useGameDataRequired();
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
        <div className={styles.desktopContainer}>
          <TerminalSection layoutId="codemaster-header">
            <TeamSymbolHeader
              teamName={gameData.playerContext?.teamName || ""}
              role="CODEMASTER"
              playerName={gameData.playerContext?.playerName}
            />
          </TerminalSection>
          <CenteredContent layoutId="codemaster-waiting">
            <TerminalCommand>MISSION LOG</TerminalCommand>
            <TerminalOutput>Waiting for operative turn...</TerminalOutput>
          </CenteredContent>
          <div />
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

  // Check if this codemaster is for the active team
  const isActiveTeam = gameData.playerContext?.teamName === activeTurn?.teamName;

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

        {isActiveTeam && (
          <div className={styles.transmitSection}>
            <button
              className={styles.transmitButton}
              onClick={onOpenCluePanel || (() => {})}
              disabled={actionState.status === "loading"}
            >
              {actionState.status === "loading" ? "TRANSMITTING..." : "TRANSMIT CLUE"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.desktopContainer}>
        <TerminalSection layoutId="codemaster-header">
          <TeamSymbolHeader
            teamName={gameData.playerContext?.teamName || ""}
            role="CODEMASTER"
            playerName={gameData.playerContext?.playerName}
          />
        </TerminalSection>

        <MiddleSection>
          <TerminalSection layoutId="codemaster-goggles">
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

          <TerminalSection layoutId="codemaster-ai-status">
            <TerminalCommand>AI ASSISTANT</TerminalCommand>
            <AiStatusIndicator gameId={gameData.publicId} />
          </TerminalSection>
        </MiddleSection>

        {isActiveTeam && (
          <TerminalSection layoutId="codemaster-actions">
            <TerminalCommand>ACTION</TerminalCommand>
            <CodeWordInput
              codeWord=""
              numberOfCards={null}
              isEditable={true}
              isLoading={actionState.status === "loading"}
              onSubmit={handleDesktopSubmit}
            />
          </TerminalSection>
        )}
      </div>
    </>
  );
};
