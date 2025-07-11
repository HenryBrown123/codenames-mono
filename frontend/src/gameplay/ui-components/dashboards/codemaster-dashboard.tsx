import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { Z_INDEX } from "@frontend/style/z-index";

/**
 * MOBILE-FIRST: Simple button to trigger modal
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
 * MOBILE: Full-screen hacker overlay with drag-to-dismiss
 */
const ClueOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${Z_INDEX.MODAL_BACKDROP};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'all' : 'none')};
  
  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const OverlayBackdrop = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-out;
  backdrop-filter: blur(4px);
`;

const CluePanel = styled.div<{ 
  $isVisible: boolean;
  $dragOffset: number;
}>`
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
  transform: translateY(${({ $isVisible, $dragOffset }) => 
    $isVisible ? `${$dragOffset}px` : '100%'
  });
  transition: ${({ $dragOffset }) => 
    $dragOffset !== 0 ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
  };
  z-index: ${Z_INDEX.MODAL_CONTENT};
  
  /* Hacker aesthetic border */
  border-top: 2px solid var(--color-primary, #00ff88);
  box-shadow: 
    0 -10px 30px rgba(0, 255, 136, 0.2),
    inset 0 1px 0 rgba(0, 255, 136, 0.3);
  
  /* Safe areas */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  
  display: flex;
  flex-direction: column;
  
  /* Drag handle indicator */
  &::before {
    content: '';
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 5px;
    background: var(--color-primary, #00ff88);
    border-radius: 3px;
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  
  /* Visual feedback during drag */
  ${({ $dragOffset }) => $dragOffset !== 0 && `
    &::before {
      opacity: 0.8;
    }
  `}
`;

const PanelHeader = styled.div`
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  position: relative;
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
  
  /* Add max-width for larger phones */
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
  
  &::before {
    content: 'CLASSIFIED';
    transform: rotate(-45deg);
  }
`;

/**
 * DESKTOP: Inline input for larger screens
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
 * Drag threshold in pixels
 */
const DRAG_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 0.5;

/**
 * Codemaster Dashboard - Mobile full-screen hacker overlay + desktop inline
 */
export const CodemasterDashboard: React.FC = () => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const [showClueModal, setShowClueModal] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setShowClueModal(false);
    setDragOffset(0);
  };

  const handleCloseModal = () => {
    setShowClueModal(false);
    setDragOffset(0);
  };

  // Touch handlers for drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    
    // Only allow dragging down
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const dragDuration = Date.now() - dragStartTime.current;
    const velocity = dragOffset / dragDuration;
    
    // Check if we should dismiss
    if (dragOffset > DRAG_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      handleCloseModal();
    } else {
      // Snap back
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  // Reset drag offset when modal closes
  useEffect(() => {
    if (!showClueModal) {
      setDragOffset(0);
    }
  }, [showClueModal]);

  if (!activeTurn || activeTurn.clue !== null) {
    return <Container />;
  }

  return (
    <>
      {/* Mobile: Simple button trigger */}
      <Container>
        <ActionButton
          onClick={() => setShowClueModal(true)}
          text="Give Clue"
          enabled={actionState.status !== "loading"}
        />
      </Container>

      {/* Mobile: Full-screen hacker overlay */}
      <ClueOverlay $isVisible={showClueModal}>
        <OverlayBackdrop 
          $isVisible={showClueModal} 
          onClick={handleCloseModal}
        />
        <CluePanel 
          ref={panelRef}
          $isVisible={showClueModal}
          $dragOffset={dragOffset}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
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