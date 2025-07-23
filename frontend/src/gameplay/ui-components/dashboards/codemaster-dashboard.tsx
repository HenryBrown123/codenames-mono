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
  ARStatusBar,
  TerminalOutput,
  TerminalToggleRow,
  ToggleHint,
  TerminalTop,
  TerminalMiddle,
  TerminalBottom,
  TerminalActions,
  SpyGogglesContainer,
  SpyGogglesText,
  SpyGogglesSwitchRow,
  SpyGogglesDot,
  SpySwitch,
  SpySlider,
  SpyStatus,
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

/**
 * Strict flexbox wrapper for desktop layout
 */
const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

/**
 * Top section - fixed height for instructions
 */
const TopSection = styled.div`
  flex: 0 0 auto;
`;

/**
 * Middle section - takes remaining space
 */
const MiddleSection = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
`;

/**
 * Bottom section - fixed at bottom for action
 */
const BottomSection = styled.div`
  flex: 0 0 auto;
  margin-top: auto;
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
          <DesktopWrapper>
            <TopSection>
              <TerminalSection>
                <TerminalCommand>MISSION LOG</TerminalCommand>
                <TerminalPrompt>
                  <TerminalOutput>Waiting for operative turn...</TerminalOutput>
                </TerminalPrompt>
              </TerminalSection>
            </TopSection>
          </DesktopWrapper>
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

      {/* Desktop terminal view with STRICT LAYOUT */}
      <TerminalContent className="desktop-only">
        <DesktopWrapper>
          {/* TOP - Instructions */}
          <TopSection>
            <TerminalSection>
              <TerminalCommand>MISSION LOG</TerminalCommand>
              <TerminalPrompt>
                <TerminalOutput>{messageText || "Awaiting orders..."}</TerminalOutput>
              </TerminalPrompt>
            </TerminalSection>
          </TopSection>

          {/* MIDDLE - Intel (Spy Goggles) */}
          <MiddleSection>
            <TerminalSection>
              <TerminalCommand>SPY GOGGLES</TerminalCommand>
              <SpyGogglesContainer>
                <SpyGogglesText>Toggle enhanced vision</SpyGogglesText>
                <SpyGogglesSwitchRow>
                  <SpyGogglesDot $active={isARMode} />
                  <SpySwitch>
                    <input type="checkbox" checked={isARMode} onChange={handleARToggle} />
                    <SpySlider />
                  </SpySwitch>
                  <SpyStatus $active={isARMode}>{isARMode ? "ON" : "OFF"}</SpyStatus>
                </SpyGogglesSwitchRow>
              </SpyGogglesContainer>
            </TerminalSection>
          </MiddleSection>

          {/* BOTTOM - Action (with box!) */}
          <BottomSection>
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
          </BottomSection>
        </DesktopWrapper>
      </TerminalContent>
    </>
  );
};
