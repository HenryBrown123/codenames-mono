import {
  GAME_STATE,
  ROUND_STATE,
  PLAYER_ROLE,
  CODEBREAKER_OUTCOME,
} from "@codenames/shared/types";
import { GameAggregate } from "../state/gameplay-state.types";
import {
  gameplayBaseSchema,
  currentRoundSchema,
  playerContextSchema,
} from "../state/gameplay-state.types";
import {
  validateWithZodSchema,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";
import { z } from "zod";

// Validation schemas for all make-guess related actions
const makeGuessActionSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
    cards: z.array(z.any()).min(1, "Must have cards to guess"),
    turns: z.array(z.any()).min(1, "Must have at least one turn"),
  }),
  playerContext: playerContextSchema.extend({
    role: z.literal(PLAYER_ROLE.CODEBREAKER),
  }),
});

const endTurnSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
    turns: z.array(z.any()).min(1, "Must have turns to end"),
  }),
});

const startTurnSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
  }),
  teams: z.array(z.any()).min(2, "Must have at least 2 teams"),
});

const endRoundSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
    // No turn status constraints - rounds can end regardless of turn state
  }),
});

// Branded types for each action
export type MakeGuessValidGameState = ValidatedGameState<
  typeof makeGuessActionSchema
>;
export type EndTurnValidGameState = ValidatedGameState<typeof endTurnSchema>;
export type StartTurnValidGameState = ValidatedGameState<
  typeof startTurnSchema
>;
export type EndRoundValidGameState = ValidatedGameState<typeof endRoundSchema>;

// Validation functions
export const validateMakeGuess = (
  data: GameAggregate,
): GameplayValidationResult<MakeGuessValidGameState> => {
  return validateWithZodSchema(makeGuessActionSchema, data);
};

export const validateEndTurn = (data: any) =>
  validateWithZodSchema(endTurnSchema, data);
export const validateStartTurn = (data: any) =>
  validateWithZodSchema(startTurnSchema, data);
export const validateEndRound = (data: any) =>
  validateWithZodSchema(endRoundSchema, data);

/**
 * Validates a specific card can be guessed
 */
export const validateGuessCard = (
  game: GameAggregate,
  cardWord: string,
): { valid: boolean; error?: string; cardId?: number } => {
  if (!game.currentRound?.cards) {
    return { valid: false, error: "No cards available to guess" };
  }

  const targetCard = game.currentRound.cards.find(
    (card) => card.word.toLowerCase() === cardWord.toLowerCase().trim(),
  );

  if (!targetCard) {
    return { valid: false, error: `Card "${cardWord}" not found on the board` };
  }

  if (targetCard.selected) {
    return {
      valid: false,
      error: `Card "${cardWord}" has already been selected`,
    };
  }

  return { valid: true, cardId: targetCard._id };
};
