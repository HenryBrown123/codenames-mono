import { TEAM, STAGE, CODEBREAKER_OUTCOME, GAME_TYPE } from "./game-constants";

export type Team = (typeof TEAM)[keyof typeof TEAM];
export type Stage = (typeof STAGE)[keyof typeof STAGE];
export type TurnOutcome =
  (typeof CODEBREAKER_OUTCOME)[keyof typeof CODEBREAKER_OUTCOME];

export type GameType = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];

// Settings type
export interface Settings {
  numberOfCards: number;
  startingTeam: Team; // Should be one of TEAM.RED or TEAM.GREEN
  numberOfAssassins: number;
}

// Card type
export interface Card {
  word: string;
  team?: Team; // Should be one of TEAM.RED, TEAM.GREEN, TEAM.ASSASSIN, or TEAM.BYSTANDER
  selected?: boolean;
}

// Turn type
export interface Turn {
  guessedWord: string;
  outcome?: TurnOutcome; // Should be one of TURN_OUTCOMES (e.g., ASSASSIN_CARD, CORRECT_TEAM_CARD, etc.)
}

// Round type
export interface Round {
  team: Team; // Should be one of TEAM.RED, TEAM.GREEN, etc.
  codeword?: string;
  guessesAllowed?: number;
  turns?: Turn[]; // Array of individual turns in the round
}

export interface Player {
  role: "codemaster" | "codebreaker";
  userId: string;
  active: boolean;
}

// GameState type
export interface GameState {
  stage: Stage; // Should be one of STAGE.INTRO, STAGE.CODEMASTER, etc.
  winner?: Team; // Winning team
  cards: Card[]; // Array of cards for the game
  rounds: Round[]; // Array of rounds in the game
}

// GameData type
export interface GameData {
  _id?: string;
  state: GameState; // The current state of the game
  settings: Settings; // Game settings
  gameType: GameType;
}
