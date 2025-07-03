import React, { memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useGameDataRequired } from "../game-data/game-data.provider";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { useTurn } from "@frontend/gameplay/turn-management";
import { GameCard } from "./game-card";
import { CardVisibilityProvider } from "./card-visibility-provider";

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

  console.log("Rendering ViewOnlyBoard");

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
