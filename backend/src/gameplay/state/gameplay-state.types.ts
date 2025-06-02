import { z } from "zod";
import {
  GAME_STATE,
  GAME_FORMAT,
  ROUND_STATE,
  PLAYER_ROLE,
} from "@codenames/shared/types";

/**
 * Schema for validating player data
 */
export const playerSchema = z.object({
  _id: z.number().int().positive(),
  publicId: z.string(),
  _userId: z.number().int().positive(),
  _gameId: z.number().int().positive(),
  _teamId: z.number().int().positive(),
  teamName: z.string(),
  statusId: z.number().int().positive(),
  publicName: z.string(),
});

/**
 * Schema for validating team data
 */
export const teamSchema = z.object({
  _id: z.number().int().positive(),
  _gameId: z.number().int().positive(),
  teamName: z.string(),
  players: z.array(playerSchema).optional().default([]),
});

/**
 * Schema for validating cards data
 */
export const cardSchema = z.object({
  _id: z.number().int().positive(),
  _roundId: z.number().int().positive(),
  _teamId: z.number().int().nullable(),
  teamName: z.string().optional().nullable(),
  word: z.string(),
  cardType: z.string(),
  selected: z.boolean(),
});

/**
 * Schema for validating guess data
 */
export const guessSchema = z.object({
  _id: z.number().int().positive(),
  _turnId: z.number().int().positive(),
  _playerId: z.number().int().positive(),
  _cardId: z.number().int().positive(),
  playerName: z.string(),
  outcome: z.string().nullable(),
  createdAt: z.date(),
});

/**
 * Schema for validating clue data
 */
export const clueSchema = z.object({
  _id: z.number().int().positive(),
  _turnId: z.number().int().positive(),
  word: z.string(),
  number: z.number().int().positive(),
  createdAt: z.date(),
});

/**
 * Schema for validating turn data
 */
export const turnSchema = z.object({
  _id: z.number().int().positive(),
  _roundId: z.number().int().positive(),
  _teamId: z.number().int().positive(),
  teamName: z.string(),
  status: z.string(),
  guessesRemaining: z.number().int(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
  clue: clueSchema.optional(),
  guesses: z.array(guessSchema).default([]),
});

/**
 * Schema for validating round data
 */
export const roundSchema = z.object({
  _id: z.number().int().positive(),
  number: z.number().int().positive(),
  status: z.enum([
    ROUND_STATE.SETUP,
    ROUND_STATE.IN_PROGRESS,
    ROUND_STATE.COMPLETED,
  ]),
  cards: z.array(cardSchema).optional().default([]),
  turns: z.array(turnSchema).optional().default([]),
  players: z.array(playerSchema).optional().default([]),
  createdAt: z.date(),
});

/**
 * Schema for player context data
 */
export const playerContextSchema = z.object({
  _userId: z.number().int().positive(),
  _playerId: z.number().int().positive(),
  _teamId: z.number().int().positive(),
  username: z.string(),
  playerName: z.string(),
  teamName: z.string(),
  role: z.enum([
    PLAYER_ROLE.SPECTATOR,
    PLAYER_ROLE.CODEMASTER,
    PLAYER_ROLE.CODEBREAKER,
    PLAYER_ROLE.NONE,
  ]),
});

/**
 * Schema for validating the current round
 */
export const currentRoundSchema = roundSchema;

export const historicalRoundSchema = z.object({
  _id: z.number().int().positive(),
  number: z.number().int().positive(),
  status: z.enum([
    ROUND_STATE.SETUP,
    ROUND_STATE.IN_PROGRESS,
    ROUND_STATE.COMPLETED,
  ]),
  _winningTeamId: z.number().int().positive().nullable(),
  winningTeamName: z.string().nullable(),
  createdAt: z.date(),
});

// Update gameplayBaseSchema to include historicalRounds
export const gameplayBaseSchema = z.object({
  _id: z.number().int().positive(),
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
  teams: z.array(teamSchema),
  currentRound: currentRoundSchema.optional().nullable(),
  historicalRounds: z.array(historicalRoundSchema).optional().default([]),
  playerContext: playerContextSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional().nullable(),
});

// Update the types
export type HistoricalRound = z.infer<typeof historicalRoundSchema>;
/**
 * Type for game state validation schemas
 */
export type GameplaySchema = z.ZodType<GameAggregate, any, GameAggregate>;

/**
 * Entity types derived from schemas
 */
export type Player = z.infer<typeof playerSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Guess = z.infer<typeof guessSchema>;
export type Clue = z.infer<typeof clueSchema>;
export type Turn = z.infer<typeof turnSchema>;
export type Round = z.infer<typeof roundSchema>;
export type PlayerContext = z.infer<typeof playerContextSchema>;
export type CurrentRound = z.infer<typeof currentRoundSchema>;
export type GameAggregate = z.infer<typeof gameplayBaseSchema>;
