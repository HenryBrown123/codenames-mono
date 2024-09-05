import React , { useState, useContext } from 'react'

import styled from 'styled-components'
import {ErrorMessage} from 'components'
import GameCard from './GameCard'
import { useGameContext } from 'hooks'

const Grid = styled.div`
    height:100%;
    flex:1;
`;

const CardsContainer = styled.div`
    display: grid;
    color: white;
    width: 100%;

    grid-auto-rows: minmax(min-content, max-content);
    grid-template-columns: repeat(5, 1fr);
    grid-row-gap: .5em;
    grid-column-gap: 1em;

    align-items: center;
    justify-content: center;
    font-family: sans-serif;    
`;



/**
 * Functional component that returns the full game board. The game board displays all words in the game
 * as well as underlying color of that card if selected.
 * 
 * e.g. boardData = [{"word":"elephant", "color":"red", "selected":false}, 
 *                   {"word":"tiger", "color":"red", "selected":false} 
 *                   ... ]
 * 
 * @param {array} boardData - json array containing words, card colors and whether selected
 */

const GameBoard = () => {

        const {boardData} = useGameContext();

        if (boardData == null || boardData.length === 0 ){
            return (
                <ErrorMessage messageText="Sorry something went wrong when trying to display the game board :( Please refresh to try again..." />
            )
        }

        const allCards = boardData.map(cardData => (
                <GameCard key={cardData._id} cardText={cardData.word} cardColor={cardData.color} cardSelected={cardData.selected} />
        ));

        return (
            <Grid id="gameboard-wrapper">
                <CardsContainer id="gameboard-container">
                    {allCards}
                </CardsContainer>
            </Grid>
        )
};

export default GameBoard
