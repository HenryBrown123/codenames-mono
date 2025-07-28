import React from "react";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { useCardVisibilityContext } from "../cards/card-visibility-provider";
import { ARRevealButton } from "./ar-reveal-button";
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
  const { triggers, viewMode } = useCardVisibilityContext();

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
    triggers.toggleSpymasterView();
  };

  const isARMode = viewMode === "spymaster";

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
  }, [handleARToggle]);

  return (
    <>
      {/* Mobile view */}
      <div className={`${styles.container} mobile-only`}>
        <ARRevealButton 
          className={styles.mobileARToggle}
          arMode={isARMode} 
          onClick={handleARToggle}
        >
          {isARMode ? "AR ON" : "REVEAL"}
        </ARRevealButton>

        <ActionButton
          className={styles.mobileTransmitButton}
          onClick={onOpenCluePanel || (() => {})}
          text="SUBMIT CLUE"
          enabled={actionState.status !== "loading"}
        />
      </div>

      {/* Desktop terminal view - clean sections only */}
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
