import React from 'react'
import styled from 'styled-components'


const ErrorMessageContainer = styled.div`
    margin: none;
    height: 100%;
`

const ErrorMessageText = styled.div`
    color: var(--color-text);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 20px;
`

const ErrorMessage = ({messageText = "Sorry, something went wrong :("}) => {
    return (
        <ErrorMessageContainer>
            <ErrorMessageText>
                <p>{messageText}</p>
            </ErrorMessageText>
        </ErrorMessageContainer>
    )
}

export default ErrorMessage
