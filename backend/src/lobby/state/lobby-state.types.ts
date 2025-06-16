import { z } from "zod";
import { GAME_STATE, GAME_TYPE } from "@codenames/shared/types";

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

export const teamSchema = z.object({
  _id: z.number().int().positive(),
  _gameId: z.number().int().positive(),
  teamName: z.string(),
  players: z.array(playerSchema).default([]),
});

export const userContextSchema = z.object({
  _userId: z.number().int().positive(),
  canModifyGame: z.boolean().default(true),
});

export const lobbyBaseSchema = z.object({
  _gameId: z.number().int().positive(),
  publicId: z.string(),
  status: z.enum([
    GAME_STATE.LOBBY,
    GAME_STATE.IN_PROGRESS,
    GAME_STATE.COMPLETED,
    GAME_STATE.ABANDONED,
    GAME_STATE.PAUSED,
  ]),
  gameType: z.enum([GAME_TYPE.SINGLE_DEVICE, GAME_TYPE.MULTI_DEVICE]),
  teams: z.array(teamSchema),
  userContext: userContextSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional().nullable(),
});

export type Player = z.infer<typeof playerSchema>;
export type Team = z.infer<typeof teamSchema>;
export type UserContext = z.infer<typeof userContextSchema>;
export type LobbyAggregate = z.infer<typeof lobbyBaseSchema>;
