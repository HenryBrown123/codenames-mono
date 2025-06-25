import { z } from "zod";
import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";
import { LobbyAggregate, lobbyBaseSchema } from "../state/lobby-state.types";
import { 
  LobbyValidationResult,
  ValidatedLobbyState,
  validateWithZodSchema
} from "../state/lobby-state.validation";

/**
 * Schema for validating round start
 */
const startRoundValidationSchema = lobbyBaseSchema
  .refine(
    (data) => data.currentRound !== null && data.currentRound !== undefined,
    {
      message: "No current round to start",
      path: ["currentRound"],
    }
  )
  .refine(
    (data) => data.status === GAME_STATE.IN_PROGRESS,
    {
      message: "Game must be in IN_PROGRESS state to start a round",
      path: ["status"],
    }
  )
  .refine(
    (data) => data.currentRound?.status === ROUND_STATE.SETUP,
    {
      message: "Round must be in SETUP state to start",
      path: ["currentRound", "status"],
    }
  )
  .refine(
    (data) => data.currentRound?.cards !== undefined && data.currentRound.cards.length > 0,
    {
      message: "Cards must be dealt before starting the round",
      path: ["currentRound", "cards"],
    }
  )
  .refine(
    (data) => data.teams.every((team) => team.players.length >= 2),
    {
      message: "Each team must have at least 2 players",
      path: ["teams"],
    }
  )
  .transform((data) => ({
    ...data,
    currentRound: {
      ...data.currentRound!,
      cards: data.currentRound!.cards!,
    },
  }));

/**
 * Type for validated start round state
 */
export type StartRoundValidLobbyState = ValidatedLobbyState<typeof startRoundValidationSchema>;

/**
 * Validates if a round can be started
 */
export function validate(
  data: LobbyAggregate
): LobbyValidationResult<StartRoundValidLobbyState> {
  return validateWithZodSchema(startRoundValidationSchema, data);
}