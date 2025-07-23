import React from "react";
import styled from "styled-components";
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

/**
 * MOBILE-FIRST: Button container
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
`;

/**
 * MOBILE: AR Toggle button for revealing spymaster view
 */
const MobileARToggle = styled(ARRevealButton)`
  position: relative;
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
`;

const DesktopContainer = styled.div`
  display: contents;

  /* Hide on mobile */
  @media (max-width: 768px) {
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

      {/* Desktop terminal view - clean sections only */}
      <DesktopContainer>
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
      </DesktopContainer>
    </>
  );
};
