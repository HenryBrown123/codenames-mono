import React from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";

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

/**
 * MOBILE: Styled action button with visual indicator
 */
const MobileTransmitButton = styled(ActionButton)`
  position: relative;
  
  /* Visual drag indicator like a handle */
  &::before {
    content: '';
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
      {/* Mobile: ActionButton with handle indicator */}
      <MobileTransmitButton 
        onClick={onOpenCluePanel}
        text="TRANSMIT CLUE"
        enabled={actionState.status !== "loading"}
      />

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