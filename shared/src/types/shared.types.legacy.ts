import {
  CARD_TYPE,
  STAGE,
  CODEBREAKER_OUTCOME,
  GAME_TYPE,
  GAME_FORMAT,
} from "./shared.constants";

// Team type
export type Team = (typeof CARD_TYPE)[keyof typeof CARD_TYPE];

// Stage type
export type Stage = (typeof STAGE)[keyof typeof STAGE];

// TurnOutcome type
export type TurnOutcome =
  (typeof CODEBREAKER_OUTCOME)[keyof typeof CODEBREAKER_OUTCOME];

// GameType type
export type GameType = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];

// Game format options
export type GameFormat = (typeof GAME_FORMAT)[keyof typeof GAME_FORMAT];

// Settings type
export interface Settings {
  numberOfCards: number;
  startingTeam: Team;
  numberOfAssassins: number;
}

// Card type
export interface Card {
  word: string;
  team?: Team;
  selected?: boolean;
}

// Turn type
export interface Turn {
  guessedWord: string;
  outcome?: TurnOutcome;
}

// Round type
export interface Round {
  team: Team;
  codeword?: string;
  guessesAllowed?: number;
  turns?: Turn[];
}

// Player type
export interface Player {
  role: "codemaster" | "codebreaker";
  userId: string;
  active: boolean;
}

// GameState type
export interface GameState {
  stage: Stage;
  winner?: Team;
  cards: Card[];
  rounds: Round[];
}

// GameData type
export interface GameData {
  _id?: string;
  state: GameState;
  settings: Settings;
  gameType: GameType;
}
