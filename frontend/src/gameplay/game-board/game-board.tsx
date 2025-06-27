import React, { useCallback, memo, useMemo, useRef } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { GameCard } from "./game-card";
import { useBoardAnimations } from "./use-board-animations";

// Add prop type
interface BoardProps {
  boardAnimations: ReturnType<typeof useBoardAnimations>;
}

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

export const CodebreakerBoard: React.FC<BoardProps> = memo(({ boardAnimations }) => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  
  const cards = gameData.currentRound?.cards || [];
  const isLoading = actionState.status === "loading";

  const handleCardClick = useCallback(
    (cardWord: string) => {
      if (!isLoading) makeGuess(cardWord);
    },
    [makeGuess, isLoading],
  );

  return (
    <CardsContainer aria-label="codebreaker game board">
      {cards.map((card, index) => {
        const cardId = `${index}-${card.word || 'empty'}`;
        const animation = boardAnimations.getCardAnimation(cardId);
        
        boardAnimations.handleServerSelection(cardId, card.selected);
        
        return (
          <GameCard
            key={cardId}
            card={card}
            cardIndex={index}
            cardId={cardId}
            animation={animation}
            onAnimationEnd={(e) => boardAnimations.handleAnimationEnd(cardId, e)}
            showTeamColors={false}
            clickable={!isLoading && !card.selected}
            onCardClick={handleCardClick}
          />
        );
      })}
    </CardsContainer>
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";

export const CodemasterBoard: React.FC<BoardProps> = memo(({ boardAnimations }) => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];

  return (
    <CardsContainer aria-label="codemaster game board">
      {cards.map((card, index) => {
        const cardId = `${index}-${card.word || 'empty'}`;
        const animation = boardAnimations.getCardAnimation(cardId);
        
        boardAnimations.handleServerSelection(cardId, card.selected);
        
        return (
          <GameCard
            key={cardId}
            card={card}
            cardIndex={index}
            cardId={cardId}
            animation={animation}
            onAnimationEnd={(e) => boardAnimations.handleAnimationEnd(cardId, e)}
            showTeamColors={true}
            clickable={false}
            onCardClick={() => {}}
          />
        );
      })}
    </CardsContainer>
  );
});

CodemasterBoard.displayName = "CodemasterBoard";

export const SpectatorBoard: React.FC<BoardProps> = memo(({ boardAnimations }) => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];
  
  // Reset animations when cards change
  const prevCardsRef = useRef<string>("");
  const cardsKey = cards.map(c => c.word).join(",");
  
  if (prevCardsRef.current && prevCardsRef.current !== cardsKey) {
    console.log("[BOARD] Cards changed, resetting all animations");
    boardAnimations.resetAllCards();
  }
  prevCardsRef.current = cardsKey;

  const displayCards = useMemo(() => {
    if (cards.length === 0) {
      return Array.from({ length: 25 }, (_, i) => ({
        word: "",
        teamName: "NEUTRAL",
        selected: false,
        cardType: "BYSTANDER",
        _id: i,
      }));
    }
    return cards;
  }, [cards]);

  return (
    <CardsContainer aria-label="spectator game board">
      {displayCards.map((card, index) => {
        const cardId = card.word === "" ? `placeholder-${index}` : `${index}-${card.word}`;
        const animation = boardAnimations.getCardAnimation(cardId);
        
        boardAnimations.handleServerSelection(cardId, card.selected);
        
        return (
          <GameCard
            key={cardId}
            card={card}
            cardIndex={index}
            cardId={cardId}
            animation={animation}
            onAnimationEnd={(e) => boardAnimations.handleAnimationEnd(cardId, e)}
            showTeamColors={false}
            clickable={false}
            onCardClick={() => {}}
          />
        );
      })}
    </CardsContainer>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";