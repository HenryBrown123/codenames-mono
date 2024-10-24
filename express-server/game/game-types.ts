/**
 * enums defining allowed team names & game stages
 */
export enum Team {
  Red = "red",
  Green = "green",
  None = "none",
  Assassin = "assassin",
}

export enum Stage {
  Intro = "intro",
  Codemaster = "codemaster",
  Codebreaker = "codebreaker",
  Gameover = "gameover",
}

/**
 * interfaces defining the structure of the game data
 */
export interface Card {
  word: string;
  team: Team;
  selected: boolean;
}

export interface Round {
  team: Team;
  codeword?: string;
  guessesAllowed?: number;
  guessedWords: string[];
}

export interface Settings {
  numberOfCards: number;
  startingTeam: Team;
  numberOfAssassins: number;
}

export interface GameState {
  stage: Stage;
  cards: Card[];
  rounds: Round[];
  winner?: Team;
}

export interface GameData {
  _id: string;
  state: GameState;
  settings: Settings;
}
