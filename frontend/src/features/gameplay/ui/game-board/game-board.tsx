import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { GameCard } from "./game-card";
import { useGameData, useGameActions } from "@frontend/game/state";

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

const BoardWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
`;

const BoardContainer = styled.div`
  width: 100%;
  max-width: 900px;
  aspect-ratio: 5 / 5;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: clamp(0.5rem, 1vw, 1rem);
  margin: auto;
  padding: clamp(0.5rem, 1vw, 1rem);
`;

interface GameBoardViewProps {
  boardMode?: BoardMode;
}

export const GameBoardView: React.FC<GameBoardViewProps> = ({ boardMode }) => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  const [isAnimating, setIsAnimating] = useState(true);

  const cards = gameData.currentRound?.cards || [];

  const handleCardClick = useCallback(
    (cardWord: string) => {
      console.log(`Card clicked: ${cardWord}`);
      makeGuess(cardWord);
    },
    [makeGuess],
  );

  const showTeamColors = useMemo(() => {
    return (
      boardMode === BOARD_MODE.CODEMASTER_ACTIVE ||
      boardMode === BOARD_MODE.CODEMASTER_READONLY
    );
  }, [boardMode]);

  const isLoading = actionState.status === "loading";

  const clickable = useMemo(() => {
    return boardMode === BOARD_MODE.CODEBREAKER && !isLoading;
  }, [boardMode, isLoading]);

  return (
    <BoardWrapper>
      <BoardContainer>
        {cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            cardIndex={index}
            showTeamColors={showTeamColors}
            clickable={clickable}
            isAnimating={isAnimating}
            onCardClick={handleCardClick}
          />
        ))}
      </BoardContainer>
    </BoardWrapper>
  );
};
