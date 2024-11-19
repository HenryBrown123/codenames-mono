import Game, { GameDocument } from "@game/game-model";
import { WordData } from "@game/word/word-model";
import { Settings } from "@game/game-common-types";
import { getRandomWords } from "@game/word/word-ctrl";
import { TEAM } from "@game/game-common-constants";
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
  gameSettings: Partial<Settings> = defaultGameSettings
): Promise<GameDocument> {
  const settings: Settings = { ...defaultGameSettings, ...gameSettings };
  try {
    const wordObjects: WordData[] = await getRandomWords(
      settings.numberOfCards
    );
    if (!wordObjects || wordObjects.length === 0) {
      throw new Error("No words found, please populate the database.");
    }
    const words: string[] = wordObjects.map((wordObj) => wordObj.word);
    const newGameData = createGameData(settings, words);
    const newGame = new Game(newGameData);
    await newGame.save();
    return newGame;
  } catch (error) {
    throw new Error(`Failed to create new game: ${error.message}`);
  }
}
