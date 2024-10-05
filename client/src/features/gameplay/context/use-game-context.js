import{ useContext, createContext} from 'react'
import {useGameData} from 'features/gameplay/api'


/**
 * main game context & dispatch function handling on screen game logic 
 */

export const GameContext = createContext(null);

export const GameContextProvider = ({ children}) => {

  const { data: game, error, isLoading } = useGameData();

  return (
    <GameContext.Provider value ={game[0].data.newgame}>
            {children}
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