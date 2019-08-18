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
        var emptyTile = {word:"",color:"",revealed:"false"}
        var emptyGame = []
        for(var i=0; i<12; i++){
            emptyGame.push(emptyTile)
        }
        this.state = {
            name:"World",
            tileColors:["grey","grey","grey","grey","grey","grey","grey","grey","grey","grey","grey","grey"], 
            words:[{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""},{word:""}],
            game: emptyGame,
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

    hideColors = () =>{
        var hiddenColors = []
        for(var index in this.state.game){
            if(!this.state.game[index].revealed){
                hiddenColors.push("grey")
            }else{
                hiddenColors.push(this.state.game[index].color)
            }
        }
        this.setState({
            tileColors : hiddenColors
        })
    }

    revealColors = () => {
        var realColors = []
        for(var index in this.state.game){
            realColors.push(this.state.game[index].color)
            console.log(realColors[index])
        }
        this.setState({
            tileColors: realColors
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

    revealColor = (tile) => {
        var colorsToShow = this.state.tileColors
        var tileColor = this.state.game[tile].color
        colorsToShow[tile]= tileColor

        var gameUpdate = this.state.game
        gameUpdate[tile].revealed=true

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
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[0]["revealed"]} style={{background: this.state.tileColors[0]}} onClick={() => this.revealColor(0)}><Word>{game[0]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[1]["revealed"]} style={{background: this.state.tileColors[1]}} onClick={() => this.revealColor(1)}><Word>{game[1]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[2]["revealed"]} style={{background: this.state.tileColors[2]}} onClick={() => this.revealColor(2)}><Word>{game[2]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[3]["revealed"]} style={{background: this.state.tileColors[3]}} onClick={() => this.revealColor(3)}><Word>{game[3]["word"]}</Word></Tile></Column> 
                            </Row>
                            <Row>
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[4]["revealed"]} style={{background: this.state.tileColors[4]}} onClick={() => this.revealColor(4)}><Word>{game[4]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[5]["revealed"]} style={{background: this.state.tileColors[5]}} onClick={() => this.revealColor(5)}><Word>{game[5]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[6]["revealed"]} style={{background: this.state.tileColors[6]}} onClick={() => this.revealColor(6)}><Word>{game[6]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[7]["revealed"]} style={{background: this.state.tileColors[7]}} onClick={() => this.revealColor(7)}><Word>{game[7]["word"]}</Word></Tile></Column> 
                            </Row>
                            <Row>
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[8]["revealed"]} style={{background: this.state.tileColors[8]}} onClick={() => this.revealColor(8)}><Word>{game[8]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[9]["revealed"]} style={{background: this.state.tileColors[9]}} onClick={() => this.revealColor(9)}><Word>{game[9]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[10]["revealed"]} style={{background: this.state.tileColors[10]}} onClick={() => this.revealColor(10)}><Word>{game[10]["word"]}</Word></Tile></Column> 
                               <Column col xl="3" lg="3" md="3" sm="3"><Tile revealed={this.state.game[11]["revealed"]} style={{background: this.state.tileColors[11]}} onClick={() => this.revealColor(11)}><Word>{game[11]["word"]}</Word></Tile></Column> 
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
                            <Column>
                                <Button variant="dark" onClick={this.revealColors}>Show Colors</Button>
                            </Column>
                            <Column>
                                <Button variant="dark" onClick={this.hideColors}>Hide Colors</Button>
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