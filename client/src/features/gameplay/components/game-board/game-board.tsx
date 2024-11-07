import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ErrorMessage } from '@game/components';
import GameCard from './game-card';
import { TEAM, STAGE } from '@game/game-common-constants';
import { Team, GameData } from '@game/game-common-types';

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

  @media (max-width: 512px) {
    // grid-template-columns: repeat(4, 1fr); // Switch to 4 columns for smaller screens
  }
`;

const GameCardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const getCardColor = (team: Team
): string => {
  
  switch (team) {
    case TEAM.ASSASSIN:
      return "black";
    case TEAM.BYSTANDER:
      return "blue";
    case TEAM.RED:
      return "red";
    case TEAM.GREEN:
      return "green";
    default:
      console.warn("Unknown team:", team);
      return "blue"; // fallback color
  }
};

type GameBoardProps = {
  gameData: GameData;
}

export const GameBoard: React.FC<GameBoardProps> = ({gameData}) => {

  if (gameData.state.cards == null || gameData.state.cards.length === 0) {
    return (
      <ErrorMessage messageText="Sorry, something went wrong when trying to display the game board :( Please refresh to try again..." />
    );
  }

  console.log("rendering game board for stage ", gameData.state.stage)

   const allCards = gameData.state.cards.map(cardData => (
      <GameCardContainer id="gamecard-container" key={cardData.word}>
        <GameCard
          cardText={cardData.word}
          cardColor={(gameData.state.stage === STAGE.CODEMASTER && cardData.selected) ? "grey" : getCardColor(cardData.team)}
          cardSelected={gameData.state.stage === STAGE.CODEMASTER || cardData.selected}
          flippable={gameData.state.stage === STAGE.CODEBREAKER? true : false}
        />
      </GameCardContainer>
    ));

  return (
    <Grid id="gameboard-wrapper">
      <CardsContainer id="gameboard-container">
        {allCards}
      </CardsContainer>
    </Grid>
  );
};
