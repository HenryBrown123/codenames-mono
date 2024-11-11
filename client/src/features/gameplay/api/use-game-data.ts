import {
  useQuery,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { GameData, Stage } from "@game/game-common-types";
import { STAGE } from "@game/game-common-constants";
import {
  exampleIntroGameState,
  exampleCodemasterStage,
  exampleCodebreakerStage,
  exampleGameOverStage,
} from "@test/mock-game-data";

const fetchStaticGameData = async (stage: Stage): Promise<GameData> => {
  try {
    let gameData: GameData;
    switch (stage) {
      case STAGE.CODEMASTER:
        gameData = exampleCodemasterStage;
        break;
      case STAGE.CODEBREAKER:
        gameData = exampleCodebreakerStage;
        break;
      case STAGE.INTRO:
        gameData = exampleIntroGameState;
        break;
      case STAGE.GAMEOVER:
        gameData = exampleGameOverStage;
        break;
      default:
        console.log("Unknown stage");
        break;
    }
    return new Promise((resolve) => {
      console.log("<--- Fetching game data --->");
      console.log(gameData);
      resolve(gameData);
    });
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};

export const useGameData = (stage: Stage): UseQueryResult<GameData, Error> => {
  return useQuery<GameData>({
    queryKey: ["game", stage],
    queryFn: () => fetchStaticGameData(stage),
  });
};
