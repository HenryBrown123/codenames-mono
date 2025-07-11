import React, { useState } from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { Z_INDEX } from "@frontend/style/z-index";

/**
 * MOBILE-FIRST: Simple container that fills dashboard space
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
 * MOBILE: Full-screen hacker overlay - OUTSIDE dashboard constraints
 */
const ClueOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${Z_INDEX.MODAL_CONTENT};
  
  /* Visibility and interaction */
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'all' : 'none')};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  
  /* Backdrop */
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  
  /* Smooth transition */
  transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
  
  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const CluePanel = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.98) 0%,
    rgba(26, 26, 46, 0.98) 100%
  );
  
  /* Slide animation */
  transform: translateY(${({ $isVisible }) => ($isVisible ? '0' : '100%')});
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  
  /* Hacker aesthetic */
  border-top: 2px solid var(--color-primary, #00ff88);
  box-shadow: 
    0 -10px 30px rgba(0, 255, 136, 0.2),
    inset 0 1px 0 rgba(0, 255, 136, 0.3);
  
  /* Safe areas */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  
  /* Layout */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  position: relative;
  flex-shrink: 0;
`;

const HackerTitle = styled.h2`
  color: var(--color-primary, #00ff88);
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 
    0 0 20px rgba(0, 255, 136, 0.5),
    0 0 40px rgba(0, 255, 136, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  /* Safe area adjustment */
  top: max(env(safe-area-inset-top), 1.5rem);

  &:hover {
    background: rgba(0, 255, 136, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* Max width for larger phones */
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const HackerDecoration = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300%;
  height: 300%;
  opacity: 0.03;
  pointer-events: none;
  font-size: 20vw;
  font-weight: 900;
  color: var(--color-primary, #00ff88);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: 'CLASSIFIED';
    transform: rotate(-45deg);
  }
`;

/**
 * MOBILE: Trigger button styled like drag handle
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

/**
 * Codemaster Dashboard - Clean implementation
 */
export const CodemasterDashboard: React.FC = () => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const [showClueModal, setShowClueModal] = useState(false);

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowClueModal(false);
  };

  const handleCloseModal = () => {
    setShowClueModal(false);
  };

  // Don't show anything if not the codemaster's turn
  if (!activeTurn || activeTurn.clue !== null) {
    return <Container />;
  }

  return (
    <>
      {/* Mobile: Trigger button in dashboard */}
      <Container>
        <MobileTriggerButton 
          onClick={() => setShowClueModal(true)}
          disabled={actionState.status === "loading"}
        >
          TRANSMIT CLUE
        </MobileTriggerButton>
      </Container>

      {/* Mobile: Full-screen overlay - rendered at root level */}
      <ClueOverlay 
        $isVisible={showClueModal}
        onClick={handleCloseModal}
      >
        <CluePanel 
          $isVisible={showClueModal}
          onClick={(e) => e.stopPropagation()}
        >
          <HackerDecoration />
          
          <PanelHeader>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
            <HackerTitle>Transmit Clue</HackerTitle>
          </PanelHeader>
          
          <PanelContent>
            <CodeWordInput
              codeWord=""
              numberOfCards={null}
              isEditable={true}
              isLoading={actionState.status === "loading"}
              onSubmit={handleSubmitClue}
            />
          </PanelContent>
        </CluePanel>
      </ClueOverlay>

      {/* Desktop: Inline input */}
      <DesktopContainer>
        <CodeWordInput
          codeWord=""
          numberOfCards={null}
          isEditable={true}
          isLoading={actionState.status === "loading"}
          onSubmit={handleSubmitClue}
        />
      </DesktopContainer>
    </>
  );
};