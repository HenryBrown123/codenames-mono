import React, {} from 'react'
import styled from 'styled-components'


const MessageContainer = styled.div`
    padding-left: 1rem;
    height: 100%;
    text-align:left;
    display: flex;
    align-items: center;
`

const Message = styled.p`
    border-radius: 15px;
    width: 100%;
    margin:0;
`

interface GameInstructionsProps { messageText: string; }

/**
 * Functional component that displays game instructions to the user. 
 * 
 * 
 * @param {String} messageText - text to display to user 
 * @param {String} messageType - the type of message
 */

const GameInstructions = (props : GameInstructionsProps) => {

    const {messageText} = props

    return (
        <MessageContainer>        
            <Message>
                {messageText}
            </Message>
        </MessageContainer>

    )
}

export default GameInstructions