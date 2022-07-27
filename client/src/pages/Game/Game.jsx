import React , { Component } from 'react'
import api from '../../api'
import { Dashboard } from './Dashboard'

import styled from 'styled-components'
import { 
        Container, 
        Column,
        Row,
        Button,
        InputGroup, 
        FormControl,
        Form,
        InputGroupAppend,
        InputGroupPrepend,
    } from 'styled-bootstrap-components'

import { Modal } from 'react-bootstrap'    

import ReactCountdownClock  from 'react-countdown-clock'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const AppContainer= styled.div.attrs({
    className: 'container',
})`
    padding-top:5px;
    margin-left: 0;
    margin-right:0; 
    width:100%;
    height:100%;
`
const Wrapper = styled.div.attrs({
    className: 'wrapper',
})` @media (min-width: 1200px) {
    max-width:100%;
  }
`

const redStyle = {
    color:'red',
    fontSize: '5rem',
  };

const greenStyle = {
color:'green',
fontSize:'5rem',
};

const sendBtnStyle = {
    border:'none',
}

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
      text-align:center;
      padding: 20px;
      margin-bottom: 10px;
      border:2px;
      border-color: black;
      border-radius: 8px;

`
const showButtonStyle = {
    width: "4rem",
    height: "4rem",
    boxSizing: "border-box",
    borderRadius:"50%",
    margin:"auto",
}

const Point = styled.div.attrs({
    className:'red-point'
})`
    width: 1.6rem;
    height: 1.6rem
    display: inline-block;
    box-sizing: border-box;
    border-radius:50%;
    text-align:center;
    border-color: black;
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

// style for modal
const display = {
    display: 'block'
  };

const hide = {
display: 'none'
};

class Game extends Component{
    constructor(props) {
        super(props)
        var emptyTile = {word:" ",color:"",revealed:false}
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
            newGameId:" ",
            clockTimes:[240,120,120,100,100,60,60,30,30,30,30], // clock timings for each go
            clockTime:240, // initial clock time
            turn:'green', // which teams turn
            wrongColor: false,  // whether the team has picked the wrong colour or not
            showTiles: false, // whether to show all the tile colors 
            paused: true, // whether timer is paused 
            started: false, // whether game has started or not
            turnNumber: 0,
            timeUp: false, // whether timer has run out 
            turnDone: false, // whether user has finished with their turn

        }
    }

    changeGameId = event => {
        this.setState({
            newGameId: event.target.value
        })
        console.log(this.state.newGameId)
      }

    handleSubmit = event => {
        this.getGame(this.state.newGameId)
        //this.setState({ game: newGame })
    }

    getGame  = async (id) => {
        this.setState({isLoading:true})
        console.log(id)
        try{
            await api.getGame(id).then(game => {
                this.setState({
                    game:game.data.game,
                    isLoading:false,
                })
            })
        }
        catch(err) {
            alert('Game not found')
            this.setState({
                newGameId: this.state.game._id
            })
        }
    } 

    getNewGame = async () => {
        this.setState({ isLoading: true })
        try{
            await api.getNewGame().then(game => {
                this.setState({
                    game: game.data.newgame,
                    newGameId: game.data.newgame._id,
                    isLoading: false,
                })
            })
        }
        catch(err) {
            alert('Game not found')
            this.setState({
                newGameId: this.state.game._id // change back to original id
            })
        }
        this.setState({
        clockTimes:[240,120,120,100,100,60,60,30,30,30,30], // clock timings for each go
        clockTime:240, // initial clock time
        turn:'green', // which teams turn
        wrongColor: false,  // whether the team has picked the wrong colour or not
        showTiles: false, // whether to show all the tile colors 
        paused: true, // whether timer is paused 
        started: false, // whether game has started or not
        turnNumber: 0,
        timeUp: false, // whether timer has run out 
        turnDone: false, // whether user has finished with their turn
        })
    }


    hideColors = () => { 
        this.setState({
            showTiles : false,
        })
    }

    showHide = () => {
        this.setState({
            showTiles: !this.state.showTiles,
        })
    }

    nextTurn = (prevTurn) => {
        const nextTurn = prevTurn === "red" ? "green" : "red"
        console.log(nextTurn)
        this.setState({
            turn:nextTurn,
            turnNumber:this.state.turnNumber+1,
            clockTime:this.state.clockTimes[this.state.turnNumber],
            paused:false,
            wrongColor:false,
            timeUp:false,
            turnDone: false,
        })
    }


    startStopGame = () => {
        //this.getNewGame()
        this.setState({paused:!this.state.paused})
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

    updateGameTile = (index) => { 
        let updatedGame = this.state.game
        updatedGame.words[index].revealed = true
        let tile_color = updatedGame.words[index].color
        // update game scores
        if(tile_color==='green'){
            updatedGame.green_score+=1
        }else if(tile_color==='red'){
            updatedGame.red_score+=1
        }else if(tile_color==='blue'){
            updatedGame.gameOver=true
        }
        // check whether tile is the correct color for the team.. if not pause timer and show "FAILED" pop-up
        // by setting wrongColor=true
        console.log(this.state.turn)
        if (this.state.turn !== tile_color) {
            this.setState({paused:!this.state.paused})
            this.setState({wrongColor:true})
            console.log("Wrong colour!")
        }

        return updatedGame

    }

    timeUp = () => {
        this.setState({timeUp:true})
        console.log("Time up!")
    }

    turnDone = () => {
        this.setState({turnDone:true})
        console.log("Time up!")
    }

    render(){
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
                            game : this.updateGameTile(index)
                        })}>
                        <Word>
                            {word["word"]}
                        </Word>
                    </Tile>
                </Column>
            )
        )

        var redScore = []
        
        for(let i =0; i<6; i++){
            let score_color = "#dc354580"
            if(i < this.state.game["red_score"]){
                score_color = "red"
            }
            else if(i===5){
                score_color="rgba(0,0,0,0)"
            }
            redScore.push(  
                <Column col xl="2" lg="2" md="2" sm="2" style={{padding:0}}> 
                    <Point  
                        style={
                            {background : score_color}
                        } 
                    />
                </Column>
            )
        }

        var greenScore = []
        
        for(let i =0; i<6; i++){
            let score_color = "#28a74587"
            if(i < this.state.game["green_score"]){
                score_color = "green"
            }
            redScore.push(  
                <Column col xl="2" lg="2" md="2" sm="2" style={{padding:0}}> 
                    <Point  
                        style={
                            {background : score_color}
                        } 
                    />
                </Column>
            )
        }
        
    
        return(
            <Wrapper>
                <Dashboard />
            </Wrapper>
        )
    }
}


export default Game