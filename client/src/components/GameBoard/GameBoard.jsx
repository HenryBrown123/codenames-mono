import React , { useState } from 'react'

import styled from 'styled-components'
import {ErrorMessage} from 'components'
import GameCard from './GameCard'

const Grid = styled.div`
    height:100%;
`;

const CardsContainer = styled.div`
  display: grid;
  color: white;
  width: 100%;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(min-content, max-content);
  grid-row-gap: .25em;
  grid-column-gap: 0.5em;

  // 5x5 grid and some more spacing
    @media (min-width: 768px) {
            grid-template-columns: repeat(5, 1fr);
            grid-row-gap: .5em;
            grid-column-gap: 1em;
        }
`;

const CardContainer = styled.div`
    text-align: center;
    color: white;
    font-family: sans-serif;    
    grid-column: span 2;

    /* Dealing with single orphan
    https://css-irl.info/controlling-leftover-grid-items/
     */

    :last-child:nth-child(2n - 1) {
    grid-column-end: 3;
    }

    @media (min-width: 768px) {          
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
