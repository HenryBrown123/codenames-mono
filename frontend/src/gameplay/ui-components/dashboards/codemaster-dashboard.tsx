import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";

/**
 * MOBILE-FIRST: Simple button container for dashboard
 */
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;

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
 * MOBILE: Trigger button styled like hacker terminal
 */
const MobileTriggerButton = styled.button`
  background: rgba(10, 10, 15, 0.9);
  border: none;
  border-top: 2px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.9rem;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  
  /* Visual drag indicator */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--color-primary, #00ff88);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * DESKTOP: Container for desktop layout
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

interface CodemasterDashboardProps {
  onOpenCluePanel?: () => void;
}

/**
 * Codemaster Dashboard - Just the trigger, overlay handled by parent
 */
export const CodemasterDashboard: React.FC<CodemasterDashboardProps> = ({ onOpenCluePanel }) => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();

  // Don't show anything if not the codemaster's turn
  if (!activeTurn || activeTurn.clue !== null) {
    return <Container />;
  }

  const handleDesktopSubmit = (word: string, count: number) => {
    giveClue(word, count);
  };

  return (
    <Container>
      {/* Mobile: Just the trigger button */}
      <MobileTriggerButton 
        onClick={onOpenCluePanel}
        disabled={actionState.status === "loading"}
        className="mobile-only"
      >
        TRANSMIT CLUE
      </MobileTriggerButton>

      {/* Desktop: Inline input */}
      <DesktopContainer>
        <CodeWordInput
          codeWord=""
          numberOfCards={null}
          isEditable={true}
          isLoading={actionState.status === "loading"}
          onSubmit={handleDesktopSubmit}
        />
      </DesktopContainer>
    </Container>
  );
};