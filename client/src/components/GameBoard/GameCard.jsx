import React , { Component } from 'react'

import styled from 'styled-components'



const Card = styled.div`
    margin: none;
    height: 100%;
    background-color: ${props => props.backGroundColor || 'var(--color-card)'};
    .p {
        font-size: 5vh;
    }
`

class GameCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
                <Card id="card">
                    <p>GameCard</p>
                </Card>
        )
    }
}

export default GameCard