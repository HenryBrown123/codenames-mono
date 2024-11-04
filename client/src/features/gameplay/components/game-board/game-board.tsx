import styled from 'styled-components';
import { ErrorMessage } from '@game/components';
import GameCard from './game-card';
import { useGameContext } from '@game/context';

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


export const GameBoard = () => {
    const boardData = useGameContext();

    if (boardData.state.cards == null || boardData.state.cards.length === 0) {
        return (
            <ErrorMessage messageText="Sorry something went wrong when trying to display the game board :( Please refresh to try again..." />
        );
    }

    const allCards = boardData.state.cards.map(cardData => (
        <GameCard 
            key={cardData._id} 
            cardText={cardData.word} 
            cardColor={cardData.colour} 
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
