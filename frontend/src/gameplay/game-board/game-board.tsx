import React, { useCallback, memo, useMemo } from "react";
import styled from "styled-components";
import { useGameData } from "@frontend/gameplay/game-data";
import { useGameActions } from "@frontend/gameplay/game-actions";
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

export const CodebreakerBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const { makeGuess, actionState } = useGameActions();
  const cards = gameData.currentRound?.cards || [];
  const isLoading = actionState.status === "loading";

  const handleCardClick = useCallback(
    (cardWord: string) => {
      makeGuess(cardWord);
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
          onCardClick={handleCardClick}
        />
      ))}
    </CardsContainer>
  );
});

CodebreakerBoard.displayName = "CodebreakerBoard";

export const CodemasterBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];

  return (
    <CardsContainer aria-label="codemaster game board">
      {cards.map((card, index) => (
        <GameCard
          key={card.word}
          card={card}
          cardIndex={index}
          showTeamColors={true}
          clickable={false}
          onCardClick={() => {}}
        />
      ))}
    </CardsContainer>
  );
});

CodemasterBoard.displayName = "CodemasterBoard";

export const SpectatorBoard: React.FC = memo(() => {
  const { gameData } = useGameData();
  const cards = gameData.currentRound?.cards || [];

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
          onCardClick={() => {}}
        />
      ))}
    </CardsContainer>
  );
});

SpectatorBoard.displayName = "SpectatorBoard";