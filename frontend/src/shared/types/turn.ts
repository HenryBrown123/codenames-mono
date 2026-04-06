import { TURN_STATUS, PLAYER_ROLE, CODEBREAKER_OUTCOME } from "@codenames/shared/types";
import type { TurnStatus, PlayerRole } from "@codenames/shared/types";
import { assertEnum } from "./assert-enum";

export type { TurnStatus };

/** A codemaster's clue: a word and a target card count */
export interface Clue {
  word: string;
  number: number;
  createdAt?: Date;
}

/** Possible outcomes when a codebreaker guesses */
export type GuessOutcome =
  | "CORRECT_TEAM_CARD"
  | "OTHER_TEAM_CARD"
  | "BYSTANDER_CARD"
  | "ASSASSIN_CARD";

/** A codebreaker's guess result */
export interface Guess {
  cardWord: string;
  playerName: string;
  outcome: string | null;
  createdAt?: Date;
}

/** Active phase on a turn — describes WHAT is active, not a specific player */
export interface TurnPhase {
  teamName: string;
  role: PlayerRole;
  isAi: boolean;
  playerName: string | null;
}

/** Lightweight turn embedded in GameData.currentRound.turns */
export interface Turn {
  id: string;
  teamName: string;
  status: TurnStatus;
  guessesRemaining: number;
  clue?: Clue;
  guesses: Guess[];
  active: TurnPhase | null;
}

/** Detailed turn from the /turns/:id endpoint */
export interface TurnData {
  id: string;
  teamName: string;
  status: TurnStatus;
  guessesRemaining: number;
  createdAt: Date;
  completedAt: Date | null;
  clue: Clue | null;
  hasGuesses: boolean;
  lastGuess: Guess | null;
  prevGuesses: Guess[];
  active: TurnPhase | null;
}

/** Asserts a string is a valid TurnStatus. Throws if the API contract is broken. */
const validTurnStatuses = new Set<string>(Object.values(TURN_STATUS));

export function assertTurnStatus(value: string): asserts value is TurnStatus {
  assertEnum<TurnStatus>(value, validTurnStatuses, "TurnStatus");
}

/** Asserts a string is a valid GuessOutcome. Throws if the API contract is broken. */
const validOutcomes = new Set<string>(Object.values(CODEBREAKER_OUTCOME));

export function assertGuessOutcome(value: string): asserts value is GuessOutcome {
  assertEnum<GuessOutcome>(value, validOutcomes, "GuessOutcome");
}

/** Re-export PlayerRole for convenience */
export type { PlayerRole };
