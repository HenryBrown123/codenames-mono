import { ROUND_STATE } from "@codenames/shared/types";
import type { RoundState } from "@codenames/shared/types";
import type { Card } from "./card";
import type { Turn } from "./turn";
import { assertEnum } from "./assert-enum";

/** Re-exported shared `RoundState` so consumers can import it from this module. */
export type { RoundState };

/** A single round within a game */
export interface Round {
  roundNumber: number;
  status: RoundState;
  winningTeamName: string | null;
  cards: Card[];
  turns: Turn[];
}

/** Asserts a string is a valid RoundState. Throws if the API contract is broken. */
const roundStates = new Set<string>(Object.values(ROUND_STATE));

/** Asserts a string narrows to a valid {@link RoundState}. Throws otherwise. */
export function assertRoundState(value: string): asserts value is RoundState {
  assertEnum<RoundState>(value, roundStates, "RoundState");
}
