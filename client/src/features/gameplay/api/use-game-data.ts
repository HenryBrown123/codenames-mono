import { useQuery, UseQueryResult } from "@tanstack/react-query";
import apis from "src/api";
import { GameData } from "@game/game-common-types";
import { exampleIntroGameState } from "@test/mock-game-data";

/**
 * Hook for retrieving game data via API.
 *
 * Should only be extended for fetching data required to play the game, meaning the game should not be
 * playable until all data has been retrieved by this function.
 *
 */

const fetchNewGame = async (): Promise<GameData> => {
  const [result] = await Promise.all([apis.getNewGame()]);
  return result.data;
};

const fetchStaticGameData = async (): Promise<GameData> => {
  try {
    const staticGameData: GameData = exampleIntroGameState;
    return new Promise((resolve) => {
      console.log("<--- Static data fetch ---->");
      console.log(staticGameData); // default prevents static file being treated as a module
      resolve(staticGameData);
    });
  } catch (error) {
    console.error("Error fetching static game data:", error);
    throw error;
  }
};

export const useGameData = (): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["game"],
    queryFn: fetchStaticGameData,
  });
};
