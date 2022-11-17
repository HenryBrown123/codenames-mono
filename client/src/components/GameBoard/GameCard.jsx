import React , { Component } from 'react'

import styled from 'styled-components'


const Card = styled.div`
    margin: none;
    height: 100%;
    background-color: ${props => props.selectedColor || 'var(--color-card)'};
    .p {
        font-size: 5vh;
    }
`

const GameCard = (cardText, cardColor, cardSelected) => {
    
    // if not selected then backgroundColor will use default set in global CSS file
    var selectedColor = null;
    if (cardSelected){
        selectedColor = cardColor;
    }
    return (
            <Card id="card" selectedColor={selectedColor} >
                <p>{cardText}</p>
            </Card>
    )
}

export default GameCard