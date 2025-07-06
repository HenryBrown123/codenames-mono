import React, { memo } from "react";
import styled from "styled-components";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { CardVisibilityProvider } from "../cards/card-visibility-provider";

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0.5rem;
  height: 100%;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 0.4rem;
  }

  @media (max-width: 768px) {
    gap: 0.3rem;
    max-width: min(90vw, 100%);
    max-height: min(50vh, 100%);
    aspect-ratio: 1;
    margin: auto;
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
 * View-only board - general purpose viewing board
 */
export const ViewOnlyBoard = memo(() => {
  const { gameData } = useGameDataRequired();
  const cards = gameData.currentRound?.cards || [];
  const isRoundSetup = gameData.currentRound?.status === "SETUP";

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
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <BoardGrid aria-label="view-only game board">
        {cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            index={index}
            onClick={() => {}}
            clickable={false}
            initialVisibility={isRoundSetup ? "hidden" : "visible"}
          />
        ))}
      </BoardGrid>
    </CardVisibilityProvider>
  );
});

ViewOnlyBoard.displayName = "ViewOnlyBoard";