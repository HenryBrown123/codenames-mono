import React , { Component } from 'react'
import styled from 'styled-components'
import {useGameContext} from 'hooks'


const StyledButton = styled.button`
    font-family: 'Press Start 2p';
    font-size: 5vh;
    text-align: center;
	display: inline-block;
	margin:5px;
    font-weight: bold;
    padding: 4vh 4vh 4vh 4vh ;
    background-color: lightgray;
    text-shadow: -1px -1px black, 1px 1px white;
    color: gray;
    -webkit-border-radius: 7px;
	-moz-border-radius: 7px;
	-o-border-radius: 7px;
	border-radius: 7px;
    box-shadow: 0 .2em gray; 
    cursor: pointer;

&:active {
	box-shadow: none;
	position: relative;
	top: .2em;
}
`

const ButtonWrapper = styled.div`

`
const ActionButton = () => {
    const game = useGameContext();
    let actionText = '' ;

    //if (game.game_paused) {
        actionText = 'PLAY';
   // };

    return (
        <ButtonWrapper>
            <StyledButton>{actionText}</StyledButton>
        </ButtonWrapper>
    )
}
export default ActionButton
