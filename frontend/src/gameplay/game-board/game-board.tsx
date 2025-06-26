import React, { useState, useCallback, memo, useMemo } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
import { usePlayerRoleScene } from "@frontend/gameplay/role-scenes";
import { GameCard } from "./game-card";

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

// Hook for flip animations based on initial scene + card words changes
const useFlipAnimation = (cards: any[]) => {
  const { isInitialScene } = usePlayerRoleScene();
  const [isFlipping, setIsFlipping] = React.useState(false);
  const [prevCardWords, setPrevCardWords] = React.useState<string>("");

  // Extract card words for comparison (only words, not selection state)
  const currentCardWords = React.useMemo(() => {
    return cards.map(card => card.word).join(",");
  }, [cards]);

  React.useEffect(() => {
    // Trigger flip animation when:
    // 1. We're in an initial scene (role transition) OR
    // 2. Card words have changed (dealing/re-dealing)
    const wordsChanged = prevCardWords !== currentCardWords && currentCardWords !== "";
    
    if (isInitialScene || wordsChanged) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 2000);
    }
    
    // Update previous words
    setPrevCardWords(currentCardWords);
  }, [isInitialScene, currentCardWords, prevCardWords]);

  return isFlipping;
};

// ============================================================================
// CODEBREAKER BOARD
// ============================================================================

export const CodebreakerBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  const cards = gameData.currentRound?.cards || [];
  const isLoading = actionState.status === "loading";
  
  // Flip animation triggered by initial scene OR card words changing
  const isDealing = useFlipAnimation(cards);

  const handleCardClick = useCallback(
    (cardWord: string) => {
      setAnimatingCards((prev) => new Set(prev).add(cardWord));
      makeGuess(cardWord);

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

  return (
    <CardsContainer aria-label="codebreaker game board">
      {cards.map((card, index) => (
        <GameCard
          key={card.word}
          card={card}
          cardIndex={index}
          showTeamColors={false}
          clickable={!isLoading && !card.selected}
          isAnimating={animatingCards.has(card.word)}
          onCardClick={handleCardClick}
          isDealing={isDealing}
        />
      ))}
    </CardsContainer>
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";

// ============================================================================
// CODEMASTER BOARD
// ============================================================================

export const CodemasterBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];
  const isDealing = useFlipAnimation(cards);

  return (
    <CardsContainer aria-label="codemaster game board">
      {cards.map((card, index) => (
        <GameCard
          key={card.word}
          card={card}
          cardIndex={index}
          showTeamColors={true}
          clickable={false}
          isAnimating={false}
          onCardClick={() => {}}
          isDealing={isDealing}
        />
      ))}
    </CardsContainer>
  );
});

CodemasterBoard.displayName = "CodemasterBoard";

// ============================================================================
// SPECTATOR BOARD
// ============================================================================

export const SpectatorBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];
  
  // For spectators, only animate on card words changing (no role transitions)
  const [isDealing, setIsDealing] = React.useState(false);
  const [prevCardWords, setPrevCardWords] = React.useState<string>("");

  // Extract card words for comparison
  const currentCardWords = React.useMemo(() => {
    return cards.map(card => card.word).join(",");
  }, [cards]);

  React.useEffect(() => {
    // Only animate when card words change (dealing/re-dealing)
    const wordsChanged = prevCardWords !== currentCardWords && currentCardWords !== "";
    
    if (wordsChanged) {
      setIsDealing(true);
      setTimeout(() => setIsDealing(false), 2000);
    }
    
    setPrevCardWords(currentCardWords);
  }, [currentCardWords, prevCardWords]);

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
      {displayCards.map((card, index) => (
        <GameCard
          key={card.word === "" ? `placeholder-${index}` : card.word}
          card={card}
          cardIndex={index}
          showTeamColors={false}
          clickable={false}
          isAnimating={false}
          onCardClick={() => {}}
          isDealing={isDealing}
        />
      ))}
    </CardsContainer>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";
