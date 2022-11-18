import React from 'react'
import styled, { keyframes } from 'styled-components'

const LoadingContainer = styled.div`
    text-align: center;
`;

const spinnerAnimation = keyframes `
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`

const Spinner = styled.div`

    width: 50px;
    height: 50px;
    border: 10px solid #f3f3f3; /* Light grey */
    border-top: 10px solid #383636; /* Black */
    border-radius: 50%;
    animation-name: ${spinnerAnimation}; 
    animation-duration: 1.5s;
    animation-iteration-count: linear infinite;
`;


const LoadingSpinner = ({displayText = "Loading..."}) => {

    console.log(displayText);

    return (
        <LoadingContainer>
            <p>{displayText}</p>
            <Spinner />
        </LoadingContainer>
    )
}

export default LoadingSpinner