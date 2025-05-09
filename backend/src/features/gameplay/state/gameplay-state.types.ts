import { z } from "zod";
import { GAME_STATE, GAME_FORMAT, ROUND_STATE } from "@codenames/shared/types";

/**
 * Schema for validating round data
 *
 * Defines the structure of a single game round with validation rules
 */
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
 * Base schema for validating game state
 *
 * Defines the core structure of a game with validation rules
 * for common properties that appear in all game states... schema
 * can be extended for specific gameplay action validation rules.
 */
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

/**
 * Type for game state validation schemas
 *
 * Used to represent schemas that can validate the GameAggregate type,
 * allowing for both the base schema and refined schemas with additional validation
 */
export type GameplaySchema = z.ZodType<GameAggregate, any, GameAggregate>;

/**
 * Round entity type
 *
 * Represents a single round within a game
 */
export type Round = z.infer<typeof roundSchema>;

/**
 * Game state aggregate type
 *
 * Represents the complete state of a game including all rounds
 */
export type GameAggregate = z.infer<typeof gameplayBaseSchema>;
