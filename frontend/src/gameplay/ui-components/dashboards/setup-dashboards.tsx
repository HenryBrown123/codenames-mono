import React from "react";
import styled from "styled-components";
import { RefreshCw } from "lucide-react";
import { useGameDataRequired } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { ActionButton } from "../../shared/components";
import { usePlayerScene } from "../../player-scenes";
import { 
  TerminalContent, 
  TerminalSection, 
  TerminalPrompt, 
  TerminalCommand, 
  TerminalStatus,
  TerminalDivider,
  TerminalActions,
  TerminalOutput,
  TerminalInstructionsSection
} from "./terminal-components";

/**
 * MOBILE-FIRST: Dashboard container that adapts to layout context
 */
const Container = styled.div`
  /* Mobile-first: Horizontal layout for bottom dashboard */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  gap: 1rem;
  position: relative;

  /* PROGRESSIVE ENHANCEMENT: Large tablet landscape - vertical in sidebar */
  @media (min-width: 769px) and (orientation: landscape) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - more space */
  @media (min-width: 1025px) {
    gap: 2rem;
    padding: 1.5rem;
  }
`;

/**
 * MOBILE-FIRST: Refresh button positioned appropriately
 */
const RefreshButton = styled.button`
  /* Mobile-first: Top-right corner, touch-friendly */
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  /* PROGRESSIVE ENHANCEMENT: Desktop - smaller, refined */
  @media (min-width: 1025px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem;
    min-width: 32px;
    min-height: 32px;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
`;

/**
 * MOBILE-FIRST: Centered button layout
 */
const CenteredContainer = styled(Container)`
  justify-content: center;
`;

/**
 * Lobby Dashboard - Mobile-first with refresh functionality
 */
export const LobbyDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { gameData } = useGameDataRequired();
  const { createRound, startRound, dealCards, actionState } = useGameActions();

  const canRedeal =
    gameData?.currentRound?.status === "SETUP" &&
    gameData.currentRound.cards &&
    gameData.currentRound.cards.length > 0;

  const handleClick = () => {
    if (
      gameData?.currentRound?.status === "SETUP" &&
      gameData.currentRound.cards &&
      gameData.currentRound.cards.length > 0
    ) {
      startRound();
      return;
    }

    if (
      gameData?.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      dealCards();
      return;
    }

    if (!gameData?.currentRound) {
      createRound();
      return;
    }
  };

  const handleRedeal = () => {
    dealCards(true);
  };

  const getButtonText = () => {
    if (!gameData?.currentRound) {
      return "Deal Cards";
    }

    if (
      gameData.currentRound?.status === "SETUP" &&
      (!gameData.currentRound.cards || gameData.currentRound.cards.length === 0)
    ) {
      return "Deal Cards";
    }

    if (gameData.currentRound?.status === "SETUP" && gameData.currentRound.cards?.length > 0) {
      return "Start Round";
    }

    return "Continue Game";
  };

  return (
    <>
      {/* Mobile view */}
      <CenteredContainer className="mobile-only">
        {canRedeal && (
          <RefreshButton
            onClick={handleRedeal}
            disabled={actionState.status === "loading"}
            title="Re-deal cards"
          >
            <RefreshCw />
          </RefreshButton>
        )}
        <ActionButton
          onClick={handleClick}
          text={getButtonText()}
          enabled={actionState.status !== "loading"}
        />
      </CenteredContainer>

      {/* Desktop terminal view */}
      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>SYSTEM READY</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Initialize mission parameters..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>

        {/* Empty middle section to keep button at bottom */}
        <div />
      </TerminalContent>

      <TerminalActions className="desktop-only">
        {canRedeal && (
          <TerminalStatus>
            Cards dealt. Verify configuration or request new deal.
          </TerminalStatus>
        )}
        
        <ActionButton
          onClick={handleClick}
          text={getButtonText()}
          enabled={actionState.status !== "loading"}
        />
        
        {canRedeal && (
          <ActionButton
            onClick={handleRedeal}
            text="REDEAL CARDS"
            enabled={actionState.status !== "loading"}
          />
        )}
      </TerminalActions>
    </>
  );
};

/**
 * Generic waiting dashboard
 */
export const WaitingDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  return (
    <>
      <Container className="mobile-only" />
      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>STANDBY MODE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Waiting for orders..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>
        <div />
        <div />
      </TerminalContent>
    </>
  );
};

/**
 * Spectator dashboard
 */
export const SpectatorDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  return (
    <>
      <Container className="mobile-only" />
      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>OBSERVER MODE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Monitoring field operations..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>
        <div />
        <div />
      </TerminalContent>
    </>
  );
};

/**
 * Dealing dashboard with loading indicator
 */
export const DealingDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  return (
    <>
      <CenteredContainer className="mobile-only">
        <div>Dealing cards...</div>
      </CenteredContainer>

      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>SYSTEM PROCESSING</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Dealing cards..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>
        <div />
        <div />
      </TerminalContent>
    </>
  );
};

/**
 * Game over dashboard
 */
export const GameoverDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { createRound, actionState } = useGameActions();

  const handleNewGame = () => {
    createRound();
  };

  return (
    <>
      <CenteredContainer className="mobile-only">
        <ActionButton
          onClick={handleNewGame}
          text="New Game"
          enabled={actionState.status !== "loading"}
        />
      </CenteredContainer>

      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>MISSION COMPLETE</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Mission concluded. Ready for new assignment."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>

        {/* Empty middle section to keep button at bottom */}
        <div />
      </TerminalContent>

      <TerminalActions className="desktop-only">
        <ActionButton
          onClick={handleNewGame}
          text="NEW MISSION"
          enabled={actionState.status !== "loading"}
        />
      </TerminalActions>
    </>
  );
};

/**
 * Outcome dashboard - Shows round outcome
 */
export const OutcomeDashboard: React.FC<{ messageText?: string }> = ({ messageText }) => {
  const { triggerSceneTransition } = usePlayerScene();
  
  const handleContinue = () => {
    triggerSceneTransition("OUTCOME_ACKNOWLEDGED");
  };

  return (
    <>
      <CenteredContainer className="mobile-only">
        <ActionButton
          onClick={handleContinue}
          text="Continue"
          enabled={true}
        />
      </CenteredContainer>

      <TerminalContent className="desktop-only">
        <TerminalInstructionsSection>
          <TerminalCommand>MISSION OUTCOME</TerminalCommand>
          <TerminalPrompt>
            <TerminalOutput>{messageText || "Analyzing mission results..."}</TerminalOutput>
          </TerminalPrompt>
        </TerminalInstructionsSection>

        {/* Empty middle section to keep button at bottom */}
        <div />
      </TerminalContent>

      <TerminalActions className="desktop-only">
        <ActionButton
          onClick={handleContinue}
          text="ACKNOWLEDGE"
          enabled={true}
        />
      </TerminalActions>
    </>
  );
};
