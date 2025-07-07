import React, { memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useGameDataRequired, useTurn } from "../../shared/providers";
import { useGameActions } from "../../player-actions";
import { GameCard } from "../cards/game-card";
import { CardVisibilityProvider } from "../cards/card-visibility-provider";

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0.5rem;
  
  /* Fill the entire container */
  width: 100%;
  height: 100%;
  
  /* No aspect ratio constraint! */
  
  /* Mobile landscape - tighter gaps */
  @media (max-width: 768px) and (orientation: landscape) {
    gap: 0.2rem;
  }
  
  @media (max-width: 1024px) {
    gap: 0.4rem;
  }

  @media (max-width: 768px) {
    gap: 0.3rem;
  }

  @media (max-width: 480px) {
    gap: 0.2rem;
  }
`;

const EmptyCard = styled.div`
  background-color: rgba(27, 9, 9, 0.25);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.123);
`;

/**
 * Interactive board - for making guesses during active play
 */
export const InteractiveBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const { makeGuess, actionState } = useGameActions();
  const { activeTurn } = useTurn();
  const cards = gameData.currentRound?.cards || [];

  const isLoading = actionState.status === "loading";

  // Determine if the current player can make guesses
  const canMakeGuess = useMemo(() => {
    if (gameData.playerContext?.role !== "CODEBREAKER") return false;
    if (!activeTurn || activeTurn.status !== "ACTIVE") return false;
    if (activeTurn.teamName !== gameData.playerContext.teamName) return false;
    if (!activeTurn.clue) return false;
    if (activeTurn.guessesRemaining <= 0) return false;

    return true;
  }, [gameData.playerContext, activeTurn]);

  const handleCardClick = useCallback(
    (word: string) => {
      if (!isLoading && canMakeGuess) {
        makeGuess(word);
      }
    },
    [makeGuess, isLoading, canMakeGuess],
  );

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
    <CardVisibilityProvider cards={cards} initialState="visible">
      <BoardGrid aria-label="interactive game board">
        {cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            onClick={() => handleCardClick(card.word)}
            clickable={canMakeGuess && !isLoading && !card.selected}
            initialVisibility="visible"
          />
        ))}
      </BoardGrid>
    </CardVisibilityProvider>
  );
});

InteractiveBoard.displayName = "InteractiveBoard";
