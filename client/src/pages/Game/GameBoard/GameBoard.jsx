import React , { Component } from 'react'

import styled from 'styled-components'

const Grid = styled.div`
`;

const CardsContainer = styled.div`
    display: flex;

    // go into CardContainerumn view
    @media (max-width: 768px) {
        flex-wrap: wrap
        flex-direction:column;
        align-items: stretch;
      }
`;

const CardContainer = styled.div`
    text-align: center;
    color: white;
    font-family: sans-serif;
    font-size: 5vh
    display: flex;
    flex-direction: column;
    justify-content: center;

    // go into CardContainerumn view
    @media (min-width: 768px) {
        flex:1;
      }
}
`;



class GameBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <Grid>
                <CardsContainer>
                    <CardContainer >These</CardContainer>
                    <CardContainer >Are</CardContainer>
                    <CardContainer >Some</CardContainer>
                    <CardContainer >Random</CardContainer>
                </CardsContainer>
                <CardsContainer>
                    <CardContainer >Words</CardContainer>
                    <CardContainer >Loooooooog</CardContainer>
                    <CardContainer >Looooog</CardContainer>
                    <CardContainer >Wooooooords</CardContainer>
                </CardsContainer>
                <CardsContainer>
                    <CardContainer >Lots</CardContainer>
                    <CardContainer >andLots</CardContainer>
                    <CardContainer >ofWords</CardContainer>
                    <CardContainer >Fiiinally</CardContainer>
                </CardsContainer>
            </Grid>
        )
    }
}

export default GameBoard
