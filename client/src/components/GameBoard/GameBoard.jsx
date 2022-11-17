import React , { Component } from 'react'

import styled from 'styled-components'
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


class GameBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cardData: null
        }
    }
    render() {
        return (
            <Grid id="gameboard-wrapper">
                <CardsContainer id="gameboard-container">
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                    <CardContainer ><GameCard /></CardContainer>
                </CardsContainer>
            </Grid>
        )
    }
}

export default GameBoard
