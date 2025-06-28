import React, { useCallback, memo, useMemo } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { usePlayerRoleScene } from "@frontend/gameplay/role-scenes";
import { GameCard } from "./game-card";
import { useCardVisibility } from "./use-card-visibility";

// New prop interface for visibility control
interface BoardProps {
  showOnMount?: boolean;
  onResetVisibility?: () => void;
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

export const CodebreakerBoard: React.FC<BoardProps> = memo(({ showOnMount = false }) => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  
  const cards = gameData.currentRound?.cards || [];
  const isLoading = actionState.status === "loading";

  // Use visibility tracking
  const visibility = useCardVisibility({ 
    cards, 
    showOnMount
  });

  const handleCardClick = useCallback(
    (cardWord: string) => {
      if (!isLoading) makeGuess(cardWord);
    },
    [makeGuess, isLoading],
  );

  return (
    <CardsContainer aria-label="codebreaker game board">
      {cards.map((card, index) => {
        const cardId = `${index}-${card.word}`;
        const animation = visibility.getRequiredAnimation(cardId, card);
        
        return (
          <GameCard
            key={`${cards.map(c => c.word).join('')}-${cardId}`}
            card={card}
            cardIndex={index}
            animation={animation}
            onAnimationComplete={() => visibility.handleAnimationComplete(cardId, animation)}
            onCardClick={handleCardClick}
            clickable={!isLoading && !card.selected}
            showTeamColors={false}
          />
        );
      })}
    </CardsContainer>
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";

export const CodemasterBoard: React.FC<BoardProps> = memo(({ showOnMount = false }) => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];

  // Use visibility tracking
  const visibility = useCardVisibility({ 
    cards, 
    showOnMount
  });

  return (
    <CardsContainer aria-label="codemaster game board">
      {cards.map((card, index) => {
        const cardId = `${index}-${card.word}`;
        const animation = visibility.getRequiredAnimation(cardId, card);
        
        return (
          <GameCard
            key={`${cards.map(c => c.word).join('')}-${cardId}`}
            card={card}
            cardIndex={index}
            animation={animation}
            onAnimationComplete={() => visibility.handleAnimationComplete(cardId, animation)}
            onCardClick={() => {}}
            clickable={false}
            showTeamColors={true}
          />
        );
      })}
    </CardsContainer>
  );
});

CodemasterBoard.displayName = "CodemasterBoard";

export const SpectatorBoard: React.FC<BoardProps> = memo(({ showOnMount = false }) => {
  const { gameData } = useGameData();
  const { isInitialScene } = usePlayerRoleScene();
  const cards = gameData.currentRound?.cards || [];
  
  // Animate on mount only if we're in the initial scene (lobby) and have cards
  const shouldAnimate = showOnMount || (isInitialScene && cards.length > 0);

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

  // Use visibility tracking
  const visibility = useCardVisibility({ 
    cards: displayCards, 
    showOnMount: shouldAnimate
  });

  return (
    <CardsContainer aria-label="spectator game board">
      {displayCards.map((card, index) => {
        const cardId = card.word === "" 
          ? `placeholder-${index}` 
          : `${index}-${card.word}`;
        
        // Skip animations for placeholder cards
        const animation = card.word === "" 
          ? null 
          : visibility.getRequiredAnimation(cardId, card);
        
        return (
          <GameCard
            key={`${cards.map(c => c.word).join('')}-${cardId}`}
            card={card}
            cardIndex={index}
            animation={animation}
            onAnimationComplete={() => visibility.handleAnimationComplete(cardId, animation)}
            onCardClick={() => {}}
            clickable={false}
            showTeamColors={false}
          />
        );
      })}
    </CardsContainer>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";