import { z } from "zod";
import {
  GameFormat,
  GAME_FORMAT,
  GameState,
  GAME_STATE,
  ROUND_STATE,
  RoundState,
} from "@codenames/shared/types";

/**
 * Game and Round entities
 */
export type Round = {
  id: number;
  gameId: number;
  roundNumber: number;
  status: RoundState;
  createdAt: Date;
};

export const roundSchema = z.object({
  id: z.number().int().positive(),
  gameId: z.number().int().positive(),
  roundNumber: z.number().int().positive(),
  status: z.enum([
    ROUND_STATE.SETUP,
    ROUND_STATE.IN_PROGRESS,
    ROUND_STATE.COMPLETED,
  ]),
  createdAt: z.date(),
});

/**
 * Game aggregate with rounds
 */
export type GameAggregate = {
  id: number;
  public_id: string;
  status: GameState;
  game_format: GameFormat;
  rounds: Round[];
};

export const gameplayBaseSchema = z.object({
  id: z.number().int().positive(),
  public_id: z.string(),
  status: z.enum([
    GAME_STATE.LOBBY,
    GAME_STATE.IN_PROGRESS,
    GAME_STATE.COMPLETED,
    GAME_STATE.ABANDONED,
    GAME_STATE.PAUSED,
  ]),
  game_format: z.enum([
    GAME_FORMAT.BEST_OF_THREE,
    GAME_FORMAT.QUICK,
    GAME_FORMAT.ROUND_ROBIN,
  ]),
  rounds: z.array(roundSchema).optional().default([]),
});
