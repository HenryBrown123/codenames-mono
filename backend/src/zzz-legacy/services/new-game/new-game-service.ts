// @ts-nocheck
import Game, { GameDocument } from "src/zzz-legacy/models/game-model";
import { WordData } from "src/zzz-legacy/models/word-model";
import { Settings } from "@codenames/shared/src/types/game-types";
import { getRandomWords } from "src/zzz-legacy/controllers/word-ctrl";
import { TEAM } from "@codenames/shared/src/game/game-constants";
import { createGameData } from "./new-game-factory";

// Default game settings object
const defaultGameSettings: Settings = {
  numberOfCards: 25,
  startingTeam: TEAM.RED,
  numberOfAssassins: 1,
};

/**
 * Creates a new game with the specified or default settings...
 * @param gameSettings - Custom game settings.
 * @returns The newly created game.
 */
export async function createNewGame(
  gameSettings: Partial<Settings> = defaultGameSettings,
): Promise<GameDocument> {
  const settings: Settings = { ...defaultGameSettings, ...gameSettings };
  try {
    const wordObjects: WordData[] = await getRandomWords(
      settings.numberOfCards,
    );
    if (!wordObjects || wordObjects.length === 0) {
      throw new Error("No words found, please populate the database.");
    }
    const words: string[] = wordObjects.map((wordObj) => wordObj.word);
    const newGameData = createGameData(settings, words);
    const newGame = new Game(newGameData);

    return newGame.save();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to create new game: ${error.message}`);
    }
    throw new Error("Failed to create new game due to an unknown error.");
  }
}
