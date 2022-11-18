import React, { useState, useEffect } from 'react';
import api from 'api';

/**
 * hook for retrieving game data via api.
 * 
 * Should only be extended for fetching data required to play the game, meaning the game should not be 
 * playable until all data has been retrieved by this function.
 * 
 */

 export const useGameData = () => {
    const [gameData, setGameData] = useState(0);
  
    useEffect(() => {
      const getGameData = async () => {
        // waiting for all required game data in parallel...  
        // add any more api calls here...
        const result = (
          await Promise.all([
            api.getNewGame()
          ])
        );
  
        const gameData = await Promise.all(
          result
        );
  
        // when the data is ready, save it to state
        setGameData(gameData[0].data.newgame);
      };
  
      getGameData();
      setTimeout(() => {  console.log("Waited 5 seconds"); }, 5000);
    }, []);

    console.log(gameData)
  
    return { gameData };
  };