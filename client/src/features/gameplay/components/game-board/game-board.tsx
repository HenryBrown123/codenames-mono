import styled from 'styled-components';
import { ErrorMessage } from '@game/components';
import GameCard from './game-card';
import { useGameContext } from '@game/context';
import { TEAM } from '@game/game-common-constants';
import { Team } from '@game/game-common-types';

const Grid = styled.div`
  height: calc(100% - 50px); // Adjust to leave space for the dashboard
  flex: 1;
`;

const CardsContainer = styled.div`
  display: grid;
  color: white;
  width: 100%;
  height: 100%;

  grid-template-columns: repeat(5, 1fr); // Ensure there are always 5 columns
  grid-template-rows: repeat(5, 1fr); // Ensure there are always 5 rows
  grid-gap: 0.5em; // Space between cards

  align-items: stretch; // Make cards stretch to fill the available height
  justify-items: stretch; // Ensure cards fill the entire width
`;

const getCardColor = (team: Team): string => {
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
      return "blue"; 
  }
};

const GameCardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const GameBoard = () => {
  const boardData = useGameContext();

  if (boardData.state.cards == null || boardData.state.cards.length === 0) {
    return (
      <ErrorMessage messageText="Sorry something went wrong when trying to display the game board :( Please refresh to try again..." />
    );
  }

  const allCards = boardData.state.cards.map(cardData => (
    <GameCardContainer key={cardData.word}>
      <GameCard 
        cardText={cardData.word} 
        cardColor={getCardColor(cardData.team)}  
        cardSelected={cardData.selected} 
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
