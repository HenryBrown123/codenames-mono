import {
  GAME_STATE,
  GAME_FORMAT,
  GAME_TYPE,
} from "@codenames/shared/types";
import type {
  GameState,
  GameFormat,
  GameType,
} from "@codenames/shared/types";
import type { Team } from "./team";
import type { Round } from "./round";
import type { PlayerContext } from "./player";
import { assertEnum } from "./assert-enum";

export type { GameState, GameFormat, GameType };

/** Core game aggregate containing all game state and metadata */
export interface GameData {
  publicId: string;
  status: GameState;
  gameType: GameType;
  gameFormat: GameFormat;
  createdAt: Date;
  teams: Team[];
  currentRound: Round | null;
  playerContext: PlayerContext | null;
}

/** Asserts API strings are valid game enum types. Throws if the API contract is broken. */
const gameStates = new Set<string>(Object.values(GAME_STATE));
const gameFormats = new Set<string>(Object.values(GAME_FORMAT));
const gameTypes = new Set<string>(Object.values(GAME_TYPE));

export function assertGameState(value: string): asserts value is GameState {
  assertEnum<GameState>(value, gameStates, "GameState");
}

export function assertGameFormat(value: string): asserts value is GameFormat {
  assertEnum<GameFormat>(value, gameFormats, "GameFormat");
}

export function assertGameType(value: string): asserts value is GameType {
  assertEnum<GameType>(value, gameTypes, "GameType");
}
