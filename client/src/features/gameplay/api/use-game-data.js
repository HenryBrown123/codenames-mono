import {useQuery} from '@tanstack/react-query'
import apis from 'api'

/**
 * hook for retrieving game data via api.
 * 
 * Should only be extended for fetching data required to play the game, meaning the game should not be 
 * playable until all data has been retrieved by this function.
 * 
 */


const fetchNewGame = async () => {
  // waiting for all required game data in parallel...  
  // add any more api calls here...
  const result = (
    await Promise.all([
      apis.getNewGame()
    ])
  );

  const gameData = await Promise.all(
    result
  );

  return gameData;

}    


export const useGameData = () => {
  return useQuery({queryKey: ['game'], queryFn: () => fetchNewGame()})
}
