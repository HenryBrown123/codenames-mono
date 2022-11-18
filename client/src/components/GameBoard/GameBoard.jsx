import React , { useState } from 'react'

import styled from 'styled-components'
import {ErrorMessage} from 'components'
import GameCard from './GameCard'

const Grid = styled.div`
    height:100%;
`;

const CardsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;  
    justify-content: space-between;
    height: 100%;

    // go into columns view
    @media (max-width: 768px) {
        flex-direction:column;
       // align-items: stretch;
      }
`;

const CardContainer = styled.div`
    text-align: center;
    color: white;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1 0 auto;                

    // 4x3 grid for desktop
    @media (min-width: 768px) {
        flex: 1 0 20%;             
      }
`

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

const GameBoard = ({boardData}) => {
        
        if (boardData == null || boardData.length === 0 ){
            return (
                <ErrorMessage messageText="Sorry something went wrong when trying to display the game board :( Please refresh to try again..." />
            )
        }

        console.log(boardData)
        console.log(Object.prototype.toString.call(boardData))

        const allCards = boardData.map(cardData => (
            <CardContainer key={cardData._id} >
                <GameCard cardText={cardData.word} cardColor={cardData.color} cardSelected={cardData.selected} />
            </CardContainer>
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
