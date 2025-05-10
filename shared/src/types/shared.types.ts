import {
  CARD_TYPE,
  STAGE,
  CODEBREAKER_OUTCOME,
  GAME_TYPE,
  GAME_FORMAT,
  ROUND_STATE,
  GAME_STATE,
} from "./shared.constants";

// Enum value types
export type Team = (typeof CARD_TYPE)[keyof typeof CARD_TYPE];
export type Stage = (typeof STAGE)[keyof typeof STAGE];
export type TurnOutcome =
  (typeof CODEBREAKER_OUTCOME)[keyof typeof CODEBREAKER_OUTCOME];
export type GameType = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];
export type GameFormat = (typeof GAME_FORMAT)[keyof typeof GAME_FORMAT];

export type GameState = (typeof GAME_STATE)[keyof typeof GAME_STATE];
export type RoundState = (typeof ROUND_STATE)[keyof typeof ROUND_STATE];

// Player types
export interface Player {
  id: number;
  userId: number;
  name: string;
  teamId: number;
  role?: "codemaster" | "codebreaker" | "spectator";
  isActive: boolean;
}

// Card types
export interface Card {
  id: number;
  word: string;
  teamId: number; // Reference to team
  selected: boolean;
}

// Clue type
export interface Clue {
  id: number;
  word: string;
  number: number;
}

// Guess type
export interface Guess {
  id: number;
  cardId: number;
  playerId: number;
  outcome?: TurnOutcome;
}

// Turn type
export interface Turn {
  id: number;
  teamId: number;
  clue?: Clue;
  guesses: Guess[];
}

// Round type
export interface Round {
  id: number;
  number: number;
  cards: Card[];
  turns: Turn[];
  startingTeamId: number;
  winningTeamId?: number;
}

// Game aggregate root
export interface Game {
  id: number;
  publicId: string;
  createdAt: Date;
  updatedAt?: Date;
  status: string;
  stage: Stage;
  gameType: GameType;
  gameFormat: GameFormat;
  currentRoundId?: number;
  winner?: Team;
  settings: {
    numberOfCards: number;
    numberOfAssassins: number;
  };
  rounds: Round[];
  players: Player[];
}

// Game creation settings
export interface GameSettings {
  gameType: GameType;
  gameFormat: GameFormat;
  numberOfCards?: number;
  numberOfAssassins?: number;
}

// Simplified game data for listings
export interface GameSummary {
  id: number;
  publicId: string;
  createdAt: Date;
  status: string;
  gameType: GameType;
  gameFormat: GameFormat;
  playerCount: number;
}
