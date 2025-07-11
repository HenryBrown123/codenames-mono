import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";
import { Z_INDEX } from "@frontend/style/z-index";

/**
 * MOBILE-FIRST: Drag handle at bottom to trigger overlay
 */
const DragTriggerContainer = styled.div`
  /* Mobile-first: Fixed at bottom for drag trigger */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.9);
  border-top: 2px solid var(--color-primary, #00ff88);
  z-index: ${Z_INDEX.DASHBOARD};
  cursor: grab;
  
  /* Safe area handling */
  padding-bottom: env(safe-area-inset-bottom);
  
  /* Visual feedback */
  &:active {
    cursor: grabbing;
  }
  
  /* Drag handle visual */
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
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  
  /* PROGRESSIVE ENHANCEMENT: Hide on desktop/tablet landscape */
  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const TriggerText = styled.div`
  color: var(--color-primary, #00ff88);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.9rem;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
`;

/**
 * MOBILE: Full-screen hacker overlay
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
  $translateY: string;
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
  transform: translateY(${({ $translateY }) => $translateY});
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: ${Z_INDEX.MODAL_CONTENT};
  will-change: transform;
  
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
 * DESKTOP: Container with button for larger screens
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
    padding: 0.5rem;
  }
`;

/**
 * Drag thresholds
 */
const DRAG_UP_THRESHOLD = 50; // pixels to trigger open
const DRAG_DOWN_THRESHOLD = 100; // pixels to trigger close
const VELOCITY_THRESHOLD = 0.5;

/**
 * Codemaster Dashboard - Mobile drag-up trigger + desktop button
 */
export const CodemasterDashboard: React.FC = () => {
  const { giveClue, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

  const handleSubmitClue = (word: string, count: number) => {
    giveClue(word, count);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Touch handlers for drag trigger
  const handleTriggerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTriggerTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaY = dragStartY.current - touch.clientY; // Inverted for drag up
    
    // Only track upward drags
    if (deltaY > 0) {
      setDragOffset(Math.min(deltaY, 100)); // Cap at 100px
    }
  };

  const handleTriggerTouchEnd = () => {
    if (!isDragging) return;
    
    const dragDuration = Date.now() - dragStartTime.current;
    const velocity = dragOffset / dragDuration;
    
    // Check if we should open
    if (dragOffset > DRAG_UP_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      setIsOpen(true);
    }
    
    setDragOffset(0);
    setIsDragging(false);
  };

  // Touch handlers for panel dismiss
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    
    // Only allow dragging down
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handlePanelTouchEnd = () => {
    if (!isDragging) return;
    
    const dragDuration = Date.now() - dragStartTime.current;
    const velocity = dragOffset / dragDuration;
    
    // Check if we should dismiss
    if (dragOffset > DRAG_DOWN_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      handleClose();
    } else {
      // Snap back
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  // Calculate panel transform
  const getPanelTransform = () => {
    if (!isOpen) return '100%';
    if (isDragging && dragOffset > 0) return `${dragOffset}px`;
    return '0';
  };

  if (!activeTurn || activeTurn.clue !== null) {
    return (
      <>
        {/* Desktop only - no action needed */}
        <DesktopContainer />
      </>
    );
  }

  return (
    <>
      {/* Mobile: Drag trigger at bottom */}
      <DragTriggerContainer
        onTouchStart={handleTriggerTouchStart}
        onTouchMove={handleTriggerTouchMove}
        onTouchEnd={handleTriggerTouchEnd}
        onTouchCancel={() => {
          setDragOffset(0);
          setIsDragging(false);
        }}
        style={{
          transform: isDragging ? `translateY(-${dragOffset}px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        <TriggerText>⬆ TRANSMIT CLUE ⬆</TriggerText>
      </DragTriggerContainer>

      {/* Mobile: Full-screen hacker overlay */}
      <ClueOverlay $isVisible={isOpen}>
        <OverlayBackdrop 
          $isVisible={isOpen} 
          onClick={handleClose}
        />
        <CluePanel 
          $translateY={getPanelTransform()}
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
          onTouchCancel={() => {
            setDragOffset(0);
            setIsDragging(false);
          }}
        >
          <HackerDecoration />
          
          <PanelHeader>
            <CloseButton onClick={handleClose}>×</CloseButton>
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

      {/* Desktop: Button trigger + inline input */}
      <DesktopContainer>
        <ActionButton
          onClick={() => setIsOpen(true)}
          text="Give Clue"
          enabled={actionState.status !== "loading"}
        />
      </DesktopContainer>
    </>
  );
};