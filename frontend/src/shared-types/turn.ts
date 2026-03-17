import { CODEBREAKER_OUTCOME } from "@codenames/shared/types";
import { assertEnum } from "./assert-enum";

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

/** Whether a turn is still accepting guesses or has finished */
export type TurnStatus = "ACTIVE" | "COMPLETED";

/** Lightweight turn embedded in GameData.currentRound.turns */
export interface Turn {
  id: string;
  teamName: string;
  status: TurnStatus;
  guessesRemaining: number;
  clue?: Clue;
  guesses: Guess[];
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
}

/** Asserts a string is a valid TurnStatus. Throws if the API contract is broken. */
const VALID_TURN_STATUSES = new Set<string>(["ACTIVE", "COMPLETED"]);

export function assertTurnStatus(value: string): asserts value is TurnStatus {
  assertEnum<TurnStatus>(value, VALID_TURN_STATUSES, "TurnStatus");
}

/** Asserts a string is a valid GuessOutcome. Throws if the API contract is broken. */
const validOutcomes = new Set<string>(Object.values(CODEBREAKER_OUTCOME));

export function assertGuessOutcome(value: string): asserts value is GuessOutcome {
  assertEnum<GuessOutcome>(value, validOutcomes, "GuessOutcome");
}
