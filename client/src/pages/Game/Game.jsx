import React, {  } from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { Dashboard, GameBoard, LoadingSpinner } from 'components'
import { useGameData, GameContextProvider } from 'hooks'
import styled from 'styled-components';

const Grid = styled.div`
    position:absolute;
    left:0;
    bottom:0;
    right:0;
    //height: calc(100vh - 90px);
    height:100%;
`;

const GameBoardContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    size: 4;
    padding: 1rem;
`;

const DashboardContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    size: 1;
`;

const GameContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;

`;


const queryClient = new QueryClient();

const Game = () => {
    return (
        // Provide the client to your App
       <QueryClientProvider client={queryClient}>
                <CodeNamesGame />
       </QueryClientProvider>
      )
}


/**
 * Functional parent component containing all child components required by game.
 * This component fetches data from db via api call and passes into child components to present to the user.
 * 
 */

const CodeNamesGame = () => {
    // this is a custom hook
    const { data, error, isLoading } = useGameData()

    if (isLoading) {
        return (<LoadingSpinner displayText={"Loading a new game :)"}/>)
    } 

    if (error) {
        return (<LoadingSpinner displayText={"Something went wrong :("}/>)
    } 

    return(
        <Grid type="grid">
            <GameContainer type="game-container">
                <GameContextProvider value = { data[0].data.newgame }>
                    <GameBoardContainer type="main-section" >
                        <GameBoard/>
                    </GameBoardContainer>
                    <DashboardContainer type="dashboard"  >
                            <Dashboard />  
                    </DashboardContainer>                         
                </GameContextProvider>
            </GameContainer>
        </Grid>
    )
};

export default Game;