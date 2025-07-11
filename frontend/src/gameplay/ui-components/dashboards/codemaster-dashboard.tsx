import React, { useState } from "react";
import styled from "styled-components";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "../../player-actions";
import { useTurn } from "../../shared/providers";
import { ActionButton } from "../../shared/components";

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
 * MOBILE: Full-screen clue entry modal
 */
const ClueModal = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(65, 63, 63, 0.98);
  backdrop-filter: blur(20px);
  z-index: 999;

  transform: translateY(${({ $isVisible }) => ($isVisible ? "0" : "100%")});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  padding-top: max(env(safe-area-inset-top), 1rem);
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (min-width: 769px) and (orientation: landscape) {
    display: none;
  }
`;

const ModalContent = styled.div`
  width: 90%;
  max-width: 400px;
  text-align: center;
  color: white;
`;


const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
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
 * Codemaster Dashboard - Mobile modal + desktop inline
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

      {/* Mobile: Full-screen modal */}
      <ClueModal $isVisible={showClueModal}>
        <CloseButton onClick={handleCloseModal}>×</CloseButton>
        <ModalContent>
          <CodeWordInput
            codeWord=""
            numberOfCards={null}
            isEditable={true}
            isLoading={actionState.status === "loading"}
            onSubmit={handleSubmitClue}
          />
        </ModalContent>
      </ClueModal>

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