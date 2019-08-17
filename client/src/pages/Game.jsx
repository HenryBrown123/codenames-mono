import React, { Component } from 'react'
import api from '../api'

import styled from 'styled-components'
import { Container, Column,Row, Button, } from 'styled-bootstrap-components'
import ReactCountdownClock  from 'react-countdown-clock'

const AppContainer= styled.div.attrs({
    className: 'container',
})`
    padding-top:5px;
    margin-left: 0;
    margin-right:0; 
`


const Tile= styled.div.attrs({
    className: 'tile',
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



const TileGrid = styled.div.attrs({
    className : 'tile-grid',

})

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
        this.state = {
            name:"World",
            tileColors:["grey","grey","grey","grey","grey","grey","grey","grey","grey","grey","grey","grey"], 
            words:[{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""}],
            game:[{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""},{word:"",color:""}],
            gameStarted: true,
            redScore:0,
            greenScore:0,
            gameOver:false,
            clockTimes:[20,15,15,10,10,5,5,3,3,1,1],
            clockTime:20,
            turn:'green',
            paused: true,
            started: false,
            turnNumber: 0,

        }
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

    showColor = (tile) => {
        var colorsToShow = this.state.tileColors
        var tileColor = this.state.game[tile].color
        colorsToShow[tile]= tileColor
        var newRedScore = this.state.redScore
        var newGreenScore = this.state.greenScore
        var gameOver = this.state.gameOver
        if(tileColor==="red"){
            newRedScore+=1
        }
        else if(tileColor ==="green"){
            newGreenScore+=1
        }
        else if(tileColor ==="blue"){
            gameOver=true
        }
        
        this.setState({ 
            tileColors : colorsToShow, 
            redScore : newRedScore, 
            greenScore : newGreenScore, 
            gameOver : gameOver
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
    render(){
        const { game, isLoading } = this.state
        console.log('TCL: Game -> render -> game', game)
        return(
            <AppContainer>
                <Panel>
                    <Container>
                        <Column> 
                            <Row> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[0]}} onClick={() => this.showColor(0)}><Word>{game[0]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[1]}} onClick={() => this.showColor(1)}><Word>{game[1]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[2]}} onClick={() => this.showColor(2)}><Word>{game[2]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[3]}} onClick={() => this.showColor(3)}><Word>{game[3]["word"]}</Word></Tile></Column> 
                            </Row>
                            <Row>
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[4]}} onClick={() => this.showColor(4)}><Word>{game[4]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[5]}} onClick={() => this.showColor(5)}><Word>{game[5]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[6]}} onClick={() => this.showColor(6)}><Word>{game[6]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[7]}} onClick={() => this.showColor(7)}><Word>{game[7]["word"]}</Word></Tile></Column> 
                            </Row>
                            <Row>
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[8]}} onClick={() => this.showColor(8)}><Word>{game[8]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[9]}} onClick={() => this.showColor(9)}><Word>{game[9]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[10]}} onClick={() => this.showColor(10)}><Word>{game[10]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile style={{background: this.state.tileColors[11]}} onClick={() => this.showColor(11)}><Word>{game[11]["word"]}</Word></Tile></Column> 
                            </Row>
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
                                <Button variant="dark" onClick={this.startGame}>New Game</Button>
                            </Column>
                            <Column col xl="3" lg="3" md="3" sm="3">
                                <h1>Red: {this.state.redScore}</h1>
                                <h1>Green: {this.state.greenScore}</h1>
                            </Column>
                        </Row>
                    </Container>
                </Panel>
            </AppContainer>
        )
    }
}

export default Game