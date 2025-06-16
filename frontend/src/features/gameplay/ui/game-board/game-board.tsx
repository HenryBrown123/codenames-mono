import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";
import { GameCard } from "./game-card";
import { Card } from "@frontend/shared-types";

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
  onCardClick?: (cardWord: string) => void;
}

export const GameBoard = memo<GameBoardProps>(
  ({ cards, boardMode, onCardClick }) => {
    const [animatingCard, setAnimatingCard] = useState<string | null>(null);

    const showTeamColors = boardMode === BOARD_MODE.CODEMASTER_ACTIVE;
    const clickable = boardMode === BOARD_MODE.CODEBREAKER;

    const handleCardClick = useCallback(
      (cardWord: string) => {
        if (!onCardClick) return;

        setAnimatingCard(cardWord);
        onCardClick(cardWord);

        setTimeout(() => setAnimatingCard(null), 1000);
      },
      [onCardClick],
    );

    return (
      <CardsContainer aria-label="game board container with cards">
        {cards.map((card, index) => (
          <GameCard
            key={card.word}
            card={card}
            cardIndex={index}
            showTeamColors={showTeamColors}
            clickable={clickable}
            isAnimating={animatingCard === card.word}
            onCardClick={handleCardClick}
          />
        ))}
      </CardsContainer>
    );
  },
);

export default GameBoard;
