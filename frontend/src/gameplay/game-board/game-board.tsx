import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { GameCard } from "./game-card";
import { useCardVisibility } from "./use-card-visibility";

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

const EmptyCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * Interactive board - for making guesses during active play
 */
export const InteractiveBoard = memo(() => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  const cards = gameData.currentRound?.cards || [];
  
  // Always start visible - only loaded during active play
  const { getCardVisibility } = useCardVisibility({ 
    cards, 
    initialState: 'visible'
  });
  
  const isLoading = actionState.status === "loading";
  
  const handleCardClick = useCallback((word: string) => {
    if (!isLoading) {
      makeGuess(word);
    }
  }, [makeGuess, isLoading]);
  
  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <BoardGrid aria-label="interactive game board">
        {Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </BoardGrid>
    );
  }
  
  return (
    <BoardGrid aria-label="interactive game board">
      {cards.map((card, index) => {
        const visibility = getCardVisibility(card);
        
        return (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            state={visibility.state}
            animation={visibility.animation}
            onAnimationComplete={visibility.completeTransition}
            onClick={() => handleCardClick(card.word)}
            clickable={!isLoading && !card.selected}
          />
        );
      })}
    </BoardGrid>
  );
});

InteractiveBoard.displayName = "InteractiveBoard";

/**
 * View-only board - general purpose viewing board
 */
export const ViewOnlyBoard = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === 'SETUP';
  
  // Show dealing animation during setup
  const { getCardVisibility } = useCardVisibility({ 
    cards, 
    initialState: isRoundSetup ? 'hidden' : 'visible'
  });
  
  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <BoardGrid aria-label="view-only game board">
        {Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </BoardGrid>
    );
  }
  
  return (
    <BoardGrid aria-label="view-only game board">
      {cards.map((card, index) => {
        const visibility = getCardVisibility(card);
        
        return (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            state={visibility.state}
            animation={visibility.animation}
            onAnimationComplete={visibility.completeTransition}
            onClick={() => {}} // View-only, no clicking
            clickable={false}
          />
        );
      })}
    </BoardGrid>
  );
});

ViewOnlyBoard.displayName = "ViewOnlyBoard";