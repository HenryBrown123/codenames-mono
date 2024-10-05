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
    font-size: calc(2vw + 2vh);
    margin:0;
`
/**
 * Functional component that displays game instructions to the user. 
 * 
 * 
 * @param {String} messageText - text to display to user 
 * @param {String} messageType - the type of message
 */

const DashboardMessage = ({messageText, messageType}) => {



    return (
        <MessageContainer>        
            <Message>
                {messageText}
            </Message>
        </MessageContainer>

    )
}

export default DashboardMessage