import React , { Component } from 'react'
import styled from 'styled-components'


const StyledButton = styled.button`
    font-family: 'Press Start 2p';
    font-size: 2rem;
    text-align: center;
	display: inline-block;
	margin:5px;
    font-weight: bold;
    padding: 10px 0 10px 10px ;
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


class ActionButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <ButtonWrapper>
                <StyledButton>PLAY</StyledButton>
            </ButtonWrapper>
        )
    }
}

export default ActionButton
