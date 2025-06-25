import { z } from "zod";
import { GAME_STATE } from "@codenames/shared/types";
import { LobbyAggregate, lobbyBaseSchema } from "../state/lobby-state.types";
import { 
  LobbyValidationResult,
  ValidatedLobbyState,
  validateWithZodSchema
} from "../state/lobby-state.validation";

/**
 * Schema for validating quick start requirements
 */
const quickStartValidationSchema = lobbyBaseSchema
  .refine(
    (data) => data.status === GAME_STATE.LOBBY,
    (data) => ({
      message: `Cannot start game in '${data.status}' state`,
      path: ["status"],
    })
  )
  .refine(
    (data) => {
      const totalPlayers = data.teams.reduce((sum, team) => sum + team.players.length, 0);
      return totalPlayers >= 4;
    },
    {
      message: "Cannot start game with less than 4 players",
      path: ["teams"],
    }
  )
  .refine(
    (data) => data.teams.length >= 2,
    {
      message: "Cannot start game with less than 2 teams", 
      path: ["teams"],
    }
  )
  .refine(
    (data) => data.teams.every((team) => team.players.length >= 2),
    {
      message: "Each team must have at least 2 players",
      path: ["teams"],
    }
  );

/**
 * Type for validated quick start state
 */
export type QuickStartValidLobbyState = ValidatedLobbyState<typeof quickStartValidationSchema>;

/**
 * Validates if a game can be quick started
 */
export function validate(
  data: LobbyAggregate
): LobbyValidationResult<QuickStartValidLobbyState> {
  return validateWithZodSchema(quickStartValidationSchema, data);
}