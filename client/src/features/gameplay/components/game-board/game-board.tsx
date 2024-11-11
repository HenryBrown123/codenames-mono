import React from "react";
import styled from "styled-components";
import GameCard from "./game-card";
import { TEAM, STAGE } from "@game/game-common-constants";
import { Team, GameData, Stage, Card } from "@game/game-common-types";

const Grid = styled.div`
  height: calc(100% - 50px); // Adjust to leave space for the dashboard
  flex: 1;
  display: flex;
  flex-direction: column;
`;

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

const GameCardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const getCardColor = (team: Team): string => {
  switch (team) {
    case TEAM.ASSASSIN:
      return "#1d2023";
    case TEAM.BYSTANDER:
      return "#4169E1";
    case TEAM.RED:
      return "#B22222";
    case TEAM.GREEN:
      return "#228B22";
    default:
      console.warn("Unknown team:", team);
      return "#4b7fb3";
  }
};

type GameBoardProps = {
  gameData: GameData;
  flipUnselectedCards?: boolean;
};

const getGameCardProps = (
  cardData: Card,
  gameStage: Stage,
  flipUnselectedCards: boolean
) => {
  return {
    cardText: cardData.word,
    cardColor: getCardColor(cardData.team),
    clickable: gameStage === STAGE.CODEBREAKER && !cardData.selected,
    codemasterView: flipUnselectedCards,
    selected: cardData.selected,
  };
};

const GameBoard: React.FC<GameBoardProps> = ({
  gameData,
  flipUnselectedCards = false,
}) => {
  const allCards = gameData.state.cards.map((cardData) => {
    const gameCardProps = getGameCardProps(
      cardData,
      gameData.state.stage,
      flipUnselectedCards
    );
    return (
      <GameCardContainer
        aria-label={`gamecard-container for word: ${cardData.word}`}
        key={cardData.word}
      >
        <GameCard {...gameCardProps} />
      </GameCardContainer>
    );
  });

  return (
    <Grid aria-label="game board wrapper">
      <CardsContainer aria-label="game board container with 25 cards">
        {allCards}
      </CardsContainer>
    </Grid>
  );
};

export default GameBoard;
