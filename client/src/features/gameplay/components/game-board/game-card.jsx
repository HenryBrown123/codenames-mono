import React, {useState} from 'react'
import styled from 'styled-components'
import Flip from "react-card-flip"

const CardContainer = styled.div`
    margin: none;
    height: 100%;
    text-align:center;
    flex: 1;
`

const Card = styled.button`
    margin: none;
    height: 100%;
    border-radius: 15px;
    width: 100%;
    background-color: ${props => props.selectedColor || 'var(--color-card)'};
    color: white;
    font-family: sans-serif;   
    font-size: 3.5vh;
`

const GameCard = ({cardText, cardColor, cardSelected}) => {

    const [flipped, setFlipped] = useState(cardSelected)

    return (
        <CardContainer>        
            <Flip isFlipped={flipped} flipDirection="vertical">
                <Card id="card" key="front" onClick={() => {
                    setFlipped(true);
                }}>
                <p>{cardText}</p>
                </Card>
                <Card id="card" key="back" onClick={() => {
                    setFlipped(true)
                }}
                selectedColor={cardColor}>
                <p>{cardText}</p>
                </Card>
            </Flip>
        </CardContainer>

    )
}

export default GameCard