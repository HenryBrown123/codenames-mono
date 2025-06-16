import React, { memo, useState } from "react";
import styled from "styled-components";
import { GameCard } from "./game-card";
import { Card } from "@frontend/shared-types";
import { useGameActions } from "@frontend/features/gameplay/state";

export const BOARD_MODE = {
  CODEMASTER_ACTIVE: "codemaster-active",
  CODEMASTER_READONLY: "codemaster-readonly",
  CODEBREAKER: "codebreaker",
  SPECTATOR: "spectator",
} as const;

export type BoardMode = (typeof BOARD_MODE)[keyof typeof BOARD_MODE];

const CardsContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 0.2em;
  align-items: stretch;
  justify-items: stretch;
`;

export interface GameBoardProps {
  cards: Card[];
  boardMode: BoardMode;
}

/**
 * Refactored GameBoard - no more prop drilling, uses callbacks for animations
 */
export const GameBoard = memo<GameBoardProps>(({ cards, boardMode }) => {
  // Track multiple animating cards using Set<string>
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const { handleMakeGuess } = useGameActions();

  const showTeamColors = boardMode === BOARD_MODE.CODEMASTER_ACTIVE;
  const clickable = boardMode === BOARD_MODE.CODEBREAKER;

  const handleCardClick = (cardWord: string) => {
    if (!clickable) return;

    // Start animation immediately on click
    setAnimatingCards((prev) => new Set(prev).add(cardWord));

    // Use callbacks to control animation lifecycle
    handleMakeGuess(cardWord, {
      onSuccess: (data) => {
        // Remove from animating set on success
        setAnimatingCards((prev) => {
          const next = new Set(prev);
          next.delete(cardWord);
          return next;
        });
        console.log(`Card ${cardWord} guessed successfully:`, data);
      },
      onError: (error) => {
        // Remove from animating set on error
        setAnimatingCards((prev) => {
          const next = new Set(prev);
          next.delete(cardWord);
          return next;
        });
        console.error(`Card ${cardWord} guess failed:`, error.message);
      },
      onSettled: () => {
        console.log(`Guess attempt for ${cardWord} completed`);
      },
    });
  };

  return (
    <CardsContainer aria-label="game board container with cards">
      {cards.map((card, index) => (
        <GameCard
          key={card.word}
          card={card}
          cardIndex={index}
          showTeamColors={showTeamColors}
          clickable={clickable && !card.selected}
          isAnimating={animatingCards.has(card.word)}
          onCardClick={handleCardClick}
        />
      ))}
    </CardsContainer>
  );
});

export default GameBoard;
