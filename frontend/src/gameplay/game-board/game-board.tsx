import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { usePlayerRoleScene } from "@frontend/gameplay/role-scenes";
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
 * Codebreaker board - cards are grey until selected
 */
export const CodebreakerBoard = memo(() => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  const cards = gameData.currentRound?.cards || [];
  
  const { getCardVisibility } = useCardVisibility({ 
    cards, 
    role: 'codebreaker'
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
      <BoardGrid aria-label="codebreaker game board">
        {Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </BoardGrid>
    );
  }
  
  return (
    <BoardGrid aria-label="codebreaker game board">
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
            showTeamColors={false}
          />
        );
      })}
    </BoardGrid>
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";

/**
 * Codemaster board - shows team colors after dealing
 */
export const CodemasterBoard = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];
  
  const { getCardVisibility } = useCardVisibility({ 
    cards, 
    role: 'codemaster'
  });
  
  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <BoardGrid aria-label="codemaster game board">
        {Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </BoardGrid>
    );
  }
  
  return (
    <BoardGrid aria-label="codemaster game board">
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
            onClick={() => {}} // Codemaster can't click cards
            clickable={false}
            showTeamColors={true}
          />
        );
      })}
    </BoardGrid>
  );
});

CodemasterBoard.displayName = "CodemasterBoard";

/**
 * Spectator board - shows grey cards like codebreaker
 */
export const SpectatorBoard = memo(() => {
  const { gameData } = useGameData();
  const { isInitialScene } = usePlayerRoleScene();
  const cards = gameData.currentRound?.cards || [];
  
  // Use lobby role with dealing animation in initial scene (lobby)
  const role = isInitialScene ? 'lobby' : 'spectator';
  
  const { getCardVisibility } = useCardVisibility({ 
    cards, 
    role
  });
  
  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <BoardGrid aria-label="spectator game board">
        {Array.from({ length: 25 }).map((_, i) => (
          <EmptyCard key={`empty-${i}`} />
        ))}
      </BoardGrid>
    );
  }
  
  return (
    <BoardGrid aria-label="spectator game board">
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
            onClick={() => {}} // Spectator can't click cards
            clickable={false}
            showTeamColors={false}
          />
        );
      })}
    </BoardGrid>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";