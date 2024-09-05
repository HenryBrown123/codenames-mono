import React, { useState, useEffect, useReducer } from 'react';
import api from 'api';
import {gameReducer} from 'hooks';
import Game from 'pages/Game/GameOld';

/**
 * hook for retrieving game data via api.
 * 
 * Should only be extended for fetching data required to play the game, meaning the game should not be 
 * playable until all data has been retrieved by this function.
 * 
 */

 export const useGameData = () => {
    const [state, dispatch] = useReducer(gameReducer, {})
  
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
        dispatch({
          type: 'NEW_GAME',
          game: gameData[0].data.newgame
          })


    }

    getGameData();

    },[]); // [] empty array added to prevent infinate api calls .... needs fixing properly...

    console.log(state.game) 

    return [state.game];
  };