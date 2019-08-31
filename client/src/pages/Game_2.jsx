import React, { Component } from 'react'
import api from '../api'

import styled from 'styled-components'
import { Container, Column,Row, Button} from 'styled-bootstrap-components'
import ReactCountdownClock  from 'react-countdown-clock'


const AppContainer= styled.div.attrs({
    className: 'container',
})`
    padding-top:5px;
    margin-left: 0;
    margin-right:0; 
    width:100%;
    height:100%;
`

const redStyle = {
    color:'red',
  };

const greenStyle = {
color:'green',
};

const newGameBtnStyle = {
    width: "100%",
    padding:"15px", 
    borderRadius:"8px",
}

const Tile= styled.div.attrs({
    className: 'tile',
    revealed:'revealed',

})`
      width: 100%;
      display: inline-block;
      box-sizing: border-box;	
      padding: 20px;
      margin-bottom: 10px;
      text-align:center;
      border:2px;
      border-color: black;
      border-radius: 8px;

`

const Panel = styled.div.attrs({
    className : 'panel',
})`
    padding: 15px 15px 15px 15px
    margin-top:5px;
    background: #A9A9A9;
`
const Word = styled.div.attrs({
    className : 'word',
    
})`font-size: 1.75rem;`

const ClockContainer = styled.div.attrs({
    className : 'clock-container',
})`
    padding-top:20px;
    padding-left:15px;
    position: relative;

`


class Game extends Component{
    constructor(props) {
        super(props)
        var emptyTile = {word:"",color:"",revealed:false}
        var emptyGame = {
            "in_progress": true,
            "game_over" : false,
            "red_score": 0,
            "green_score": 0,
            "words":[]
        }
        for(var i=0; i<12; i++){
            emptyGame["words"].push(emptyTile)
        }
        this.state = {
            name:"World",
            game: emptyGame,
            clockTimes:[20,15,15,10,10,5,5,3,3,1,1],
            clockTime:20,
            turn:'green',
            showTiles: false,
            paused: true,
            started: false,
            turnNumber: 0,

        }
    }

    hideColors = () => { 
        this.setState({
            showTiles : false,
        })
    }

    revealColors = () => {
        this.setState({
            showTiles: true,
        })
    }

    nextTurn = (prevTurn) => {
        const nextTurn = prevTurn === "red" ? "green" : "red"
        console.log(nextTurn)
        this.setState({
            turn:nextTurn,
            turnNumber:this.state.turnNumber+1,
            clockTime:this.state.clockTimes[this.state.turnNumber]
        })
    }


    startGame = () => {
        this.setState({started : true, paused:false})
    }

    pauseGamme = () => {
        this.setState({paused : true})
    }

    
    componentDidMount = async () => {
        this.setState({ isLoading: true })

        await api.getGame().then(game => {
            this.setState({
                //words: words.data.words,
                game: game.data.newgame,
                isLoading: false,
            })
        })
    }

    updateGameTile = (index, element) => {
        let updatedGame = this.state.game
        updatedGame.words[index].revealed = true
        let tile_color = updatedGame.words[index].color
        if(tile_color==='green'){
            updatedGame.green_score+=1
        }else if(tile_color==='red'){
            updatedGame.red_score+=1
        }else if(tile_color==='blue'){
            updatedGame.gameOver=true
        }
        return updatedGame

    }

    render(){
        const { game, isLoading } = this.state
        console.log('TCL: Game -> render -> game', game)
        var wordTiles = this.state.game["words"].map((word,index) => (
                <Column col xl="3" lg="3" md="3" sm="3">
                    <Tile 
                        revealed={word["selected"]} 
                        style={
                            word["revealed"] || this.state.showTiles ? 
                                {background: word["color"]} 
                            : 
                                {background: "grey"}
                            } 
                        onClick={() => this.setState({ 
                            game : this.updateGameTile(index,"revealed")
                        })}>
                        <Word>
                            {word["word"]}
                        </Word>
                    </Tile>
                </Column>
            )
        )


        return(
            <AppContainer>
                <Panel>
                    <Container>
                        <Column> 
                            <Row>{wordTiles.slice(0,4)}</Row>
                            <Row>{wordTiles.slice(4,8)}</Row>
                            <Row>{wordTiles.slice(8,12)}</Row>
                        </Column>
                    </Container>
                    <Container>
                        <Row>
                            <Column col xl="3" lg="3" md="3" sm="3">
                                <ClockContainer>
                                    <ReactCountdownClock seconds={this.state.clockTime}
                                        key = {this.state.turnNumber}
                                        color={this.state.turn}
                                        alpha={0.9}
                                        size={150}
                                        paused={this.state.paused}
                                        onComplete={()=>this.nextTurn(this.state.turn)}
                                        />
                                </ClockContainer>
                            </Column>
                            <Column col xl="3" lg="3" md="3" sm="3">
                                <h1 style={redStyle}>{this.state.game.red_score}</h1>
                                <h1 style={greenStyle}>{this.state.game.green_score}</h1>
                            </Column>
                            <Column col xl="3" lg="3" md="3" sm="3">
                                <Button variant="dark" onClick={this.revealColors}>Show</Button>
                                <Button variant="dark" onClick={this.hideColors}>Hide</Button>
                            </Column>
                            <Column col xl="3" lg="3" md="3" sm="3" style={{padding:"15x"}}>
                                <Button variant="dark" onClick={this.startGame} style ={newGameBtnStyle}> 
                                    New Game
                                </Button>
                            </Column>
                        </Row>
                    </Container>
                </Panel>
            </AppContainer>
        )
    }
}


export default Game