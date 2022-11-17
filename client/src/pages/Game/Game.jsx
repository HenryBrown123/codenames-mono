import React, { Component } from 'react'
import { Dashboard } from 'components/Dashboard'
import { GameBoard } from 'components/GameBoard'
import api from 'api'

import styled from 'styled-components';

const Grid = styled.div`
    position:absolute;
    left:0;
    bottom:0;
    right:0;
    //height: calc(100vh - 90px);
    height:100%;
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

class Game extends Component{
    constructor(props) {
        super(props)
        this.state = {
            game: null,
            isLoading: false, 
            newGameId: null
        }
    }

    
    componentDidMount = async () => {
        this.setState({ isLoading: true })

        await api.getNewGame().then(game => {
            this.setState({
                game: game.data.newgame,
                isLoading: false,
            })
            this.setState({
                newGameId: this.state.game._id,
            })
        })
    }


    render(){
        if (this.state.game == null || this.state.isLoading) {
            return (<div><p>Loading game...</p></div>)
        }
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

export default Game;