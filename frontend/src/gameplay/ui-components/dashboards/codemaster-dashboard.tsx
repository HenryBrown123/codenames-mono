import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { useCardVisibilityContext } from "../cards/card-visibility-provider";
import { ARRevealButton } from "./ar-reveal-button";
import { ARToggleSwitch } from "./ar-toggle-switch";
import {
  TerminalContent,
  TerminalSection,
  TerminalPrompt,
  TerminalCommand,
  TerminalDivider,
  CompactTerminalActions,
  ARStatusBar,
  TerminalOutput,
  TerminalToggleRow,
  ToggleHint,
} from "./terminal-components";

/**
 * MOBILE-FIRST: Button container with AR toggle logic
 */
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 0.5rem;

  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
  }

  @media (min-width: 1025px) {
    gap: 2rem;
    padding: 1.5rem;
  }
`;

/**
 * MOBILE: AR Toggle button for revealing spymaster view
 */
const MobileARToggle = styled(ARRevealButton)`
  position: relative;

  /* Hide on desktop */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

/**
 * DESKTOP: Container for desktop layout with both buttons
 */
const DesktopContainer = styled.div`
  display: none;

  @media (min-width: 769px) and (orientation: landscape) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 1.5rem;
  }
`;

/**
 * DESKTOP: AR Toggle button for desktop
 */
const DesktopARToggle = styled(ARRevealButton)`
  /* Only show on desktop */
  display: none;

  @media (min-width: 769px) and (orientation: landscape) {
    display: block;
    position: relative;
    bottom: auto;
    right: auto;
  }
`;

/**
 * MOBILE: Styled action button with visual indicator
 */
const MobileTransmitButton = styled(ActionButton)`
  position: relative;

  /* Visual drag indicator like a handle */
  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--color-primary, #00ff88);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }

  /* Hide on desktop */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

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
        <Container className="mobile-only" />
        <TerminalContent className="desktop-only">
          <TerminalSection>
            <TerminalCommand>STANDBY MODE</TerminalCommand>
            <TerminalPrompt>
              <TerminalOutput>Waiting for operative turn...</TerminalOutput>
            </TerminalPrompt>
          </TerminalSection>
        </TerminalContent>
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
      {/* Mobile view stays the same */}
      <Container className="mobile-only">
        <MobileARToggle arMode={isARMode} onClick={handleARToggle}>
          {isARMode ? "AR ON" : "REVEAL"}
        </MobileARToggle>

        <MobileTransmitButton
          onClick={onOpenCluePanel || (() => {})}
          text="SUBMIT CLUE"
          enabled={actionState.status !== "loading"}
        />
      </Container>

      {/* Desktop terminal view - REDESIGNED */}
      <TerminalContent className="desktop-only">
        <TerminalSection>
          <TerminalCommand>MISSION STATUS</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Awaiting orders..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalSection>

        <TerminalDivider />

        <TerminalSection>
          <TerminalCommand>INTEL TRANSMISSION</TerminalCommand>

          {/* Toggle on its own line with better spacing */}
          <TerminalToggleRow>
            <ARToggleSwitch active={isARMode} onChange={handleARToggle} />
            <ToggleHint>(Alt+A)</ToggleHint>
          </TerminalToggleRow>

          <ARStatusBar $active={isARMode}>
            {isARMode ? "Operative positions revealed" : "Activate AR to reveal positions"}
          </ARStatusBar>
        </TerminalSection>
        <TerminalDivider />
        {/* Spacer to center the input area */}
        <div style={{ flex: 1 }} />

        {/* ALWAYS show clue input - it's the primary action! */}
        <CompactTerminalActions>
          <CodeWordInput
            codeWord=""
            numberOfCards={null}
            isEditable={true}
            isLoading={actionState.status === "loading"}
            onSubmit={handleDesktopSubmit}
          />
        </CompactTerminalActions>
      </TerminalContent>
    </>
  );
};
