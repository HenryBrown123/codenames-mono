import {
  GAME_STATE,
  ROUND_STATE,
  PLAYER_ROLE,
  GameFormat,
} from "@codenames/shared/types";
import {
  GameAggregate,
  Card,
  HistoricalRound,
} from "../state/gameplay-state.types";
import {
  gameplayBaseSchema,
  currentRoundSchema,
  playerContextSchema,
  cardSchema,
  turnSchema,
  teamSchema,
} from "../state/gameplay-state.types";
import {
  validateWithZodSchema,
  ValidatedGameState,
  GameplayValidationResult,
} from "../state/gameplay-state.validation";
import { z } from "zod";

/**
 * Validation schemas for make-guess related actions
 */
const makeGuessActionSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
    cards: z.array(cardSchema).min(1, "Must have cards to guess"),
    turns: z.array(turnSchema).min(1, "Must have at least one turn"),
  }),
  playerContext: playerContextSchema.extend({
    role: z.literal(PLAYER_ROLE.CODEBREAKER),
  }),
});

const endTurnSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
    turns: z.array(turnSchema).min(1, "Must have turns to end"),
  }),
});

const startTurnSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
  }),
  teams: z.array(teamSchema).min(2, "Must have at least 2 teams"),
});

const endRoundSchema = gameplayBaseSchema.extend({
  status: z.literal(GAME_STATE.IN_PROGRESS),
  currentRound: currentRoundSchema.extend({
    status: z.literal(ROUND_STATE.IN_PROGRESS),
  }),
});

/**
 * Branded types for each action
 */
export type MakeGuessValidGameState = ValidatedGameState<
  typeof makeGuessActionSchema
>;
export type EndTurnValidGameState = ValidatedGameState<typeof endTurnSchema>;
export type StartTurnValidGameState = ValidatedGameState<
  typeof startTurnSchema
>;
export type EndRoundValidGameState = ValidatedGameState<typeof endRoundSchema>;

/**
 * Validation functions
 */
export const validateMakeGuess = (
  data: GameAggregate,
): GameplayValidationResult<MakeGuessValidGameState> => {
  return validateWithZodSchema(makeGuessActionSchema, data);
};

export const validateEndTurn = (
  data: GameAggregate,
): GameplayValidationResult<EndTurnValidGameState> => {
  return validateWithZodSchema(endTurnSchema, data);
};

export const validateStartTurn = (
  data: GameAggregate,
): GameplayValidationResult<StartTurnValidGameState> => {
  return validateWithZodSchema(startTurnSchema, data);
};

export const validateEndRound = (
  data: GameAggregate,
): GameplayValidationResult<EndRoundValidGameState> => {
  return validateWithZodSchema(endRoundSchema, data);
};

/**
 * Pure domain functions for game state evaluation
 */
export const gameRules = {
  /**
   * Gets current score for each team based on completed rounds
   */
  getTeamScores(
    historicalRounds: HistoricalRound[],
    team1Id: number,
    team2Id: number,
  ): { team1Wins: number; team2Wins: number } {
    let team1Wins = 0;
    let team2Wins = 0;

    historicalRounds
      .filter(
        (round) =>
          round.status === ROUND_STATE.COMPLETED && round._winningTeamId,
      )
      .forEach((round) => {
        if (round._winningTeamId === team1Id) team1Wins++;
        if (round._winningTeamId === team2Id) team2Wins++;
      });

    return { team1Wins, team2Wins };
  },

  /**
   * Checks if any team has won the current round
   * Returns winning team ID or null if round continues
   */
  checkRoundWinner(
    cards: Card[],
    guessingTeamId: number,
    otherTeamId: number,
  ): number | null {
    // Check if assassin was hit - other team wins immediately
    const assassinCard = cards.find((card) => card.cardType === "ASSASSIN");
    if (assassinCard?.selected) {
      return otherTeamId;
    }

    // Check if guessing team has completed all their cards
    const guessingTeamUnselected = cards.filter(
      (card) =>
        card.cardType === "TEAM" &&
        card._teamId === guessingTeamId &&
        !card.selected,
    );
    if (guessingTeamUnselected.length === 0) {
      return guessingTeamId;
    }

    // Check if other team has completed all their cards
    const otherTeamUnselected = cards.filter(
      (card) =>
        card.cardType === "TEAM" &&
        card._teamId === otherTeamId &&
        !card.selected,
    );
    if (otherTeamUnselected.length === 0) {
      return otherTeamId;
    }

    return null; // Round continues
  },

  /**
   * Checks if any team has won the overall game
   */
  checkGameWinner(
    historicalRounds: HistoricalRound[],
    gameFormat: GameFormat,
    team1Id: number,
    team2Id: number,
  ): number | null {
    const { team1Wins, team2Wins } = this.getTeamScores(
      historicalRounds,
      team1Id,
      team2Id,
    );

    switch (gameFormat) {
      case "QUICK":
        return team1Wins > 0 ? team1Id : team2Wins > 0 ? team2Id : null;
      case "BEST_OF_THREE":
        return team1Wins >= 2 ? team1Id : team2Wins >= 2 ? team2Id : null;
      case "ROUND_ROBIN":
        return team1Wins >= 3 ? team1Id : team2Wins >= 3 ? team2Id : null;
      default:
        return null;
    }
  },

  /**
   * Determines if another round should be created based on game format and current state
   */
  canCreateNextRound(
    historicalRounds: HistoricalRound[],
    gameFormat: GameFormat,
  ): boolean {
    const maxRounds = {
      QUICK: 1,
      BEST_OF_THREE: 3,
      ROUND_ROBIN: 5,
    }[gameFormat];

    const completedRounds = historicalRounds.filter(
      (round) => round.status === ROUND_STATE.COMPLETED,
    ).length;

    return completedRounds < maxRounds;
  },
};
