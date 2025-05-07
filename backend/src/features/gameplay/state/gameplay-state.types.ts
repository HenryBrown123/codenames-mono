// src/features/gameplay/state/gameplay-state.types.ts
import { z } from "zod";
import { GAME_STATE, GAME_FORMAT, ROUND_STATE } from "@codenames/shared/types";

// Define the domain schemas first using Zod
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

// Define GameplaySchema type to accept both base and refined schemas
export type GameplaySchema = z.ZodType<GameAggregate, any, GameAggregate>;

// Then extract the TypeScript types from the schemas
export type Round = z.infer<typeof roundSchema>;
export type GameAggregate = z.infer<typeof gameplayBaseSchema>;
