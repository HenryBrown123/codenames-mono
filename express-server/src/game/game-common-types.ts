import { TEAM, STAGE } from "./game-common-constants";

export type Team = (typeof TEAM)[keyof typeof TEAM];
export type Stage = (typeof STAGE)[keyof typeof STAGE];

// Types defining the structure of the game data
export type Card = {
  word: string;
  team: Team;
  selected: boolean;
};

export type Round = {
  team: Team;
  codeword?: string;
  guessesAllowed?: number;
  guessedWords?: string[];
};

export type Settings = {
  numberOfCards: number;
  startingTeam: Team;
  numberOfAssassins: number;
};

export type GameState = {
  stage: Stage;
  cards: Card[];
  rounds: Round[];
  winner?: Team;
};

export type GameData = {
  _id: string;
  state: GameState;
  settings: Settings;
};
