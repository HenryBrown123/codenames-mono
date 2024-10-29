import { Document } from "mongoose";
import Game from "@game/game-model";
import { WordDocument } from "@game/word/word-model";
import { Settings, Team } from "@game/game-common-types";
import { getRandomWords } from "@game/word/word-ctrl.js";
import { TEAM } from "@game/game-common-constants";

// Default game settings object
const defaultGameSettings: Settings = {
  numberOfCards: 25,
  startingTeam: TEAM.GREEN,
  numberOfAssassins: 1,
};

/**
 * Generates an array of colors to be allocated randomly to the game words for any number of total cards
 * @param settings - Game settings.
 * @param otherTeam - The other team's color.
 * @returns Array of colors.
 */
const generateColorsToAllocate = (
  settings: Settings,
  otherTeam: Team
): Team[] => {
  const numberOfCardsNonTeam = Math.round((8 / 25) * settings.numberOfCards);
  const numberOfCardsStartingTeam = Math.ceil(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2
  );
  const numberOfCardsOtherTeam = Math.floor(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2
  );
  const numberOfCardsAssassins = settings.numberOfAssassins;
  const numberOfCardsBystander =
    settings.numberOfCards -
    numberOfCardsStartingTeam -
    numberOfCardsOtherTeam -
    numberOfCardsAssassins;

  const startingTeamCards: Team[] = Array.from(
    { length: numberOfCardsStartingTeam },
    () => settings.startingTeam
  );
  const otherTeamCards: Team[] = Array.from(
    { length: numberOfCardsOtherTeam },
    () => otherTeam
  );
  const assassinCards: Team[] = Array.from(
    { length: numberOfCardsAssassins },
    () => TEAM.ASSASSIN
  );
  const bystanderCards: Team[] = Array.from(
    { length: numberOfCardsBystander },
    () => TEAM.BYSTANDER
  );

  return [
    ...startingTeamCards,
    ...otherTeamCards,
    ...assassinCards,
    ...bystanderCards,
  ];
};

/**
 * Creates a new game with the specified or default settings.
 * @param gameSettings - Custom game settings.
 * @returns The newly created game.
 */
export async function createNewGame(
  gameSettings: Partial<Settings> = defaultGameSettings
): Promise<Document> {
  const settings: Settings = { ...defaultGameSettings, ...gameSettings };
  const otherTeam =
    settings.startingTeam === TEAM.GREEN ? TEAM.RED : TEAM.GREEN;
  const colorsToAllocate = generateColorsToAllocate(settings, otherTeam);

  try {
    const words: WordDocument[] = await getRandomWords(settings.numberOfCards);
    if (!words || words.length === 0) {
      throw new Error("No words found, please populate the database.");
    }

    const gameWords = words.map((word) => {
      const randomIndex = Math.floor(Math.random() * colorsToAllocate.length);
      const wordColor = colorsToAllocate.splice(randomIndex, 1)[0];
      return { word: word.word, team: wordColor };
    });

    const newGame = new Game({
      settings,
      state: { cards: gameWords, rounds: [{ team: settings.startingTeam }] },
    });

    await newGame.save();
    return newGame;
  } catch (error) {
    throw new Error(`Failed to create new game: ${error.message}`);
  }
}
