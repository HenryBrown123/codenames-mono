import React, { memo } from "react";
import styled from "styled-components";
import { useGameDataRequired } from "../../shared/providers";
import { GameCard } from "../cards/game-card";
import { CardVisibilityProvider } from "../cards/card-visibility-provider";

const BoardAspectWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) and (orientation: portrait) {
    width: 90vw;
    max-width: 100%;
    aspect-ratio: 5 / 6;
    max-height: 60vh;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    aspect-ratio: 5 / 5.5;
    width: 85vw;
  }

  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    aspect-ratio: 5 / 6.5;
    width: 80vw;
    max-height: 70vh;
  }
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 1rem;
  width: 100%;
  height: 100%;
  
  /* Tablet portrait */
  @media (max-width: 1024px) {
    gap: 0.6rem;
  }
  
  /* Mobile portrait */
  @media (max-width: 768px) and (orientation: portrait) {
    gap: 0.3rem;
  }
  
  /* Mobile landscape */
  @media (max-width: 768px) and (orientation: landscape) {
    gap: 0.2rem;
  }
  
  /* Small mobile */
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
      <BoardAspectWrapper>
        <BoardGrid aria-label="view-only game board">
          {Array.from({ length: 25 }).map((_, i) => (
            <EmptyCard key={`empty-${i}`} />
          ))}
        </BoardGrid>
      </BoardAspectWrapper>
    );
  }

  return (
    <CardVisibilityProvider cards={cards} initialState={isRoundSetup ? "hidden" : "visible"}>
      <BoardAspectWrapper>
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
      </BoardAspectWrapper>
    </CardVisibilityProvider>
  );
});

ViewOnlyBoard.displayName = "ViewOnlyBoard";
