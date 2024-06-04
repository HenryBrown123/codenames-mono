import React, { useState, useEffect, useRef } from 'react'
import { Dashboard, GameBoard, LoadingSpinner } from 'components'
import { useGameData } from 'hooks'
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


/**
 * Functional parent component containing all child components required by game.
 * This component fetches data from db via api call and passes into child components to present to the user.
 * 
 */

const Game = () => {
    const [openDashboard, setOpenDashboard] = useState(false)
    // const sheetRef = useRef(BottomSheetRef)

    // this is game data returned by api call
    const { gameData } = useGameData();
    if (!gameData) {
        return (<LoadingSpinner displayText={"Loading a new game :)"} />)
    }

    return(
        <Grid type="grid">
            <GameContainer type="game-container">
                <GameBoardContainer type="main-section" >
                    <GameBoard boardData={gameData.words}/>
                </GameBoardContainer>
  
                <DashboardContainer type="dashboard"  >
                            <Dashboard />  
                </DashboardContainer>
            </GameContainer>
        </Grid>
    )
};

export default Game;