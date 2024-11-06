import { TEAM, STAGE } from "./game-common-constants";

export type Team = (typeof TEAM)[keyof typeof TEAM];
export type Stage = (typeof STAGE)[keyof typeof STAGE];

export type Card = {
  word: string;
  team: Team;
  selected: boolean;
  display?: boolean; // front-end only. Set to true for codemaster stage
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
  state: GameState;
  settings: Settings;
  _id: string;
};
