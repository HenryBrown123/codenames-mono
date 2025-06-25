import { z } from "zod";
import { ROUND_STATE, PLAYER_ROLE } from "@codenames/shared/types";
import { LobbyAggregate, lobbyBaseSchema } from "../state/lobby-state.types";
import { 
  LobbyValidationResult,
  ValidatedLobbyState,
  validateWithZodSchema
} from "../state/lobby-state.validation";

/**
 * Schema for validating role assignment
 */
const assignRolesValidationSchema = lobbyBaseSchema
  .refine(
    (data) => data.currentRound !== null && data.currentRound !== undefined,
    {
      message: "No current round to assign roles to",
      path: ["currentRound"],
    }
  )
  .refine(
    (data) => data.currentRound?.status === ROUND_STATE.SETUP,
    {
      message: "Round must be in SETUP state to assign roles",
      path: ["currentRound", "status"],
    }
  )
  .refine(
    (data) => {
      if (!data.currentRound?.players) return true;
      return data.currentRound.players.every(
        (player) => !player.role || player.role === PLAYER_ROLE.NONE
      );
    },
    {
      message: "Roles have already been assigned for this round",
      path: ["currentRound", "players"],
    }
  )
  .refine(
    (data) => data.teams.every((team) => team.players.length >= 2),
    {
      message: "Each team must have at least 2 players to assign roles",
      path: ["teams"],
    }
  )
  .transform((data) => ({
    ...data,
    currentRound: data.currentRound!,
  }));

/**
 * Type for validated assign roles state
 */
export type AssignRolesValidLobbyState = ValidatedLobbyState<typeof assignRolesValidationSchema>;

/**
 * Validates if roles can be assigned
 */
export function validate(
  data: LobbyAggregate
): LobbyValidationResult<AssignRolesValidLobbyState> {
  return validateWithZodSchema(assignRolesValidationSchema, data);
}