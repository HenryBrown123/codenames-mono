import styled from 'styled-components';
import { ErrorMessage } from '@game/components';
import GameCard from './game-card';
import { useGameContext } from '@game/context';
import { TEAM } from '@game/game-common-constants';
import { Team } from '@game/game-common-types';

const Grid = styled.div`
    height: 100%;
    flex: 1;
`;

const CardsContainer = styled.div`
    display: grid;
    color: white;
    width: 100%;

    grid-auto-rows: minmax(min-content, max-content);
    grid-template-columns: repeat(5, 1fr);
    grid-row-gap: 0.5em;
    grid-column-gap: 1em;

    align-items: center;
    justify-content: center;
    font-family: sans-serif;    
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


export const GameBoard = () => {
    const boardData = useGameContext();

    if (boardData.state.cards == null || boardData.state.cards.length === 0) {
        return (
            <ErrorMessage messageText="Sorry something went wrong when trying to display the game board :( Please refresh to try again..." />
        );
    }

    const allCards = boardData.state.cards.map(cardData => (
        <GameCard 
            key={cardData.word} 
            cardText={cardData.word} 
            cardColor={getCardColor(cardData.team)}  
            cardSelected={cardData.selected} 
        />
    ));

    return (
        <Grid id="gameboard-wrapper">
            <CardsContainer id="gameboard-container">
                {allCards}
            </CardsContainer>
        </Grid>
    );
};
