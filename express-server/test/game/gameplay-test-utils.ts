import { TEAM, STAGE } from "@game/game-common-constants";
import { GameState, Card, GameData, Settings } from "@game/game-common-types";
import { WordData } from "@game/word/word-model";

/**
 * Generated selected
 * @param selectedWords
 * @returns
 */
export const generateCards = (selectedWords: string[]): Card[] => {
  return [
    { word: "red1", team: TEAM.RED, selected: selectedWords.includes("red1") },
    { word: "red2", team: TEAM.RED, selected: selectedWords.includes("red2") },
    {
      word: "green1",
      team: TEAM.GREEN,
      selected: selectedWords.includes("green1"),
    },
    {
      word: "green2",
      team: TEAM.GREEN,
      selected: selectedWords.includes("green2"),
    },
    {
      word: "assassin",
      team: TEAM.ASSASSIN,
      selected: selectedWords.includes("assassin"),
    },
  ];
};
export const hasWinner = (inputGameState: GameState): boolean => {
  return getWinnerProperty(inputGameState) !== null;
};

/**
 * Checks whether a winner is set on the game state object
 *
 * @param inputGameState h
 * @returns
 */
export const getWinnerProperty = (inputGameState: GameState): string | null => {
  return inputGameState.winner || null;
};

export const mockWords = (numberOfWords: Number): WordData[] => {
  return Array.from({ length: 25 }, (_, i) => ({
    word: `word${i + 1}`,
  }));
};

export const mockNewGameData = {
  settings: { numberOfCards: 25, startingTeam: TEAM.RED, numberOfAssassins: 1 },
  state: {
    stage: STAGE.INTRO,
    cards: mockWords(25).map((word) => ({
      word: word.word,
      team: TEAM.RED,
      selected: false,
    })),
    rounds: [{ team: TEAM.RED }],
  },
};

export const mockNonDefaultNewGameData = (
  expectedSettings: Settings
): GameData => {
  return {
    settings: expectedSettings,
    state: {
      stage: STAGE.INTRO,
      cards: mockWords(expectedSettings.numberOfCards).map((word) => ({
        word: word.word,
        team: TEAM.RED,
        selected: false,
      })),
      rounds: [{ team: TEAM.RED }],
    },
  };
};
