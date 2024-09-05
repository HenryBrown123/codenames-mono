import React, { useState, useContext, createContext, useReducer } from 'react'


/**
 * main game context & dispatch function handling on screen game logic 
 */

export const GameContext = createContext(null);
export const GameDispatchContext = createContext(null);

const initialGameState = {
  loading: true,
  error: '',
  game: {}
}

export const GameContextProvider = ({ children }) => {
  const [game, dispatch] = useReducer(gameReducer, initialGameState );

  return (
    <GameContext.Provider value ={game}>
      <GameDispatchContext.Provider value = {dispatch}>
            {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
};

/**
 * Dedicated useContext hooks for use by child components GameContext and GameDispatchContext 
 * @returns 
 */

export const useGameContext = () => {
  return useContext(GameContext)
};

export const useGameDispatchContext = () => {
    return useContext(GameDispatchContext)
  };

/**
 * Reducer handling on screen game logic and updating the game context
 */

export const gameReducer = (state, action) => {
    switch(action.type){
        case 'GET_GAME': {
            return action.game;
        }
        case 'NEW_GAME': {
            console.log(action)
            return {...state, game: action.game}
        }
    default: 
        return state;
    }
}