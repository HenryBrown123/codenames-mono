import { useQuery } from "@tanstack/react-query";
import apis from "src/api";
import { GameData } from "@game/game-common-types";

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

export const useGameData = () => {
  return useQuery<GameData>({
    queryKey: ["game"],
    queryFn: fetchNewGame,
  });
};
