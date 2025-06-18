import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { GameCard } from "./game-card";
import { useGameData, useGameActions } from "@frontend/features/gameplay/state";
import { GameData, Card } from "@frontend/shared-types";

/**
 * Board display modes that control card visibility and interactivity
 */
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

interface GameBoardViewProps {
  boardMode: BoardMode;
  gameData: GameData;
  interactive?: boolean;
}

/**
 * GameBoardView component that accepts props from the UI state mappings
 */
export const GameBoardView: React.FC<GameBoardViewProps> = ({
  boardMode,
  gameData: propGameData,
  interactive,
}) => {
  // Use gameData from props if provided, otherwise fall back to hook
  const { gameData: hookGameData } = useGameData();
  const gameData = propGameData || hookGameData;

  const { makeGuess, actionState } = useGameActions();

  // Track multiple animating cards using Set<string> (from working version)
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  const cards = gameData.currentRound?.cards || [];

  const handleCardClick = useCallback(
    (cardWord: string) => {
      console.log(`Card clicked: ${cardWord}`);

      // Start animation immediately on click (from working version)
      setAnimatingCards((prev) => new Set(prev).add(cardWord));

      makeGuess(cardWord);

      // Remove from animating set after action completes
      setTimeout(() => {
        setAnimatingCards((prev) => {
          const next = new Set(prev);
          next.delete(cardWord);
          return next;
        });
      }, 1000);
    },
    [makeGuess],
  );

  const showTeamColors = useMemo(() => {
    return boardMode === BOARD_MODE.CODEMASTER_ACTIVE;
  }, [boardMode]);

  const isLoading = actionState.status === "loading";

  const clickable = useMemo(() => {
    // Use the interactive prop if provided, otherwise use board mode logic
    if (interactive !== undefined) {
      return interactive && !isLoading;
    }
    return boardMode === BOARD_MODE.CODEBREAKER && !isLoading;
  }, [boardMode, isLoading, interactive]);

  return (
    <CardsContainer aria-label="game board container with cards">
      {cards.map((card: Card, index: number) => (
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
};
