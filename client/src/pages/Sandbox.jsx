import React, { Component } from 'react'
import { Dashboard } from './Game'
import { GameBoard } from './Game'

import styled from 'styled-components'

const Grid = styled.div`
    position:absolute;
    left:0;
    bottom:0;
    right:0;
    //height: calc(100vh - 90px);
    height:100%
`;

const GameContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const GameSection = styled.div`
    flex: ${(props) => props.size};
`;

class SandBox extends Component{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render(){
        return(
            <Grid type="grid">
                <GameContainer type="game-container">
                    <GameSection type="main-section" size={4} >
                        <GameBoard />
                    </GameSection>
                    <GameSection type="dashboard" size={1}  >
                        <Dashboard />  
                    </GameSection>
                </GameContainer>
            </Grid>
        )
    }
}

export default SandBox