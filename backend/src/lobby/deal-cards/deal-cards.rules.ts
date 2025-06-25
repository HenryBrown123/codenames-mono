import { z } from "zod";
import { ROUND_STATE } from "@codenames/shared/types";
import { LobbyAggregate, lobbyBaseSchema } from "../state/lobby-state.types";
import { 
  LobbyValidationResult,
  ValidatedLobbyState,
  validateWithZodSchema
} from "../state/lobby-state.validation";

/**
 * Schema for validating card dealing
 */
const dealCardsValidationSchema = lobbyBaseSchema
  .refine(
    (data) => data.currentRound !== null && data.currentRound !== undefined,
    {
      message: "No current round to deal cards to",
      path: ["currentRound"],
    }
  )
  .refine(
    (data) => data.currentRound?.status === ROUND_STATE.SETUP,
    {
      message: "Round must be in SETUP state to deal cards",
      path: ["currentRound", "status"],
    }
  )
  .refine(
    (data) => !data.currentRound?.cards || data.currentRound.cards.length === 0,
    {
      message: "Cards have already been dealt for this round",
      path: ["currentRound", "cards"],
    }
  )
  .refine(
    (data) => data.teams.length >= 2,
    {
      message: "Game must have at least 2 teams to deal cards",
      path: ["teams"],
    }
  )
  .transform((data) => ({
    ...data,
    currentRound: data.currentRound!,
  }));

/**
 * Type for validated deal cards state
 */
export type DealCardsValidLobbyState = ValidatedLobbyState<typeof dealCardsValidationSchema>;

/**
 * Validates if cards can be dealt
 */
export function validate(
  data: LobbyAggregate
): LobbyValidationResult<DealCardsValidLobbyState> {
  return validateWithZodSchema(dealCardsValidationSchema, data);
}