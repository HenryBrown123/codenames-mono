import { PLAYER_ROLE } from "@codenames/shared/types";
import type { PlayerRole } from "@codenames/shared/types";
import { assertEnum } from "./assert-enum";

export type { PlayerRole };

/** Player within a team roster */
export interface TeamPlayer {
  publicId: string;
  name: string;
  isActive: boolean;
}

/** The current viewer's identity within a game */
export interface PlayerContext {
  publicId: string;
  playerName: string;
  teamName: string;
  role: PlayerRole;
}

/** Asserts a string is a valid PlayerRole. Throws if the API contract is broken. */
const playerRoles = new Set<string>(Object.values(PLAYER_ROLE));

export function assertPlayerRole(value: string): asserts value is PlayerRole {
  assertEnum<PlayerRole>(value, playerRoles, "PlayerRole");
}
