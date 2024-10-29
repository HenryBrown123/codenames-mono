import { TEAM } from "@game/game-common-constants";
import { GameState, Card, Stage, Round } from "@game/game-common-types";

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
  return getWinnerProperty !== null;
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
