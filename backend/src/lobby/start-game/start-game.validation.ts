import { z } from "zod";
import { PlayerResult } from "@backend/common/data-access/repositories/players.repository";

/**
 * Schema for starting a game
 */
export const startGameRequestSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, "Game ID is required"),
  }),
  auth: z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
  }),
});

/**
 * Type for the parsed start game request
 */
export type ValidatedStartGameRequest = z.infer<typeof startGameRequestSchema>;

/**
 * Response schema for starting a game
 */
export const startGameResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      game: z.object({
        publicId: z.string(),
        status: z.string(),
      }),
    }),
  })
  .brand<"GameApiResponse">();

/**
 * Type for the response schema
 */
export type StartGameResponse = z.infer<typeof startGameResponseSchema>;

/**
 * Error object returned when game cannot be started
 */
export type GameStartValidationError = {
  valid: false;
  reason: string;
};

/**
 * Success object returned when game can be started
 */
export type GameStartValidationSuccess = {
  valid: true;
};

/**
 * Type for the validation result
 */
export type GameStartValidationResult =
  | GameStartValidationSuccess
  | GameStartValidationError;

/**
 * Pure function to validate if a game can be started
 *
 * @param gameStatus - Current status of the game
 * @param players - List of players in the game
 * @returns Validation result indicating if the game can be started and why not if applicable
 */
export function validateGameCanBeStarted(
  gameStatus: string,
  players: PlayerResult[],
): GameStartValidationResult {
  // Validate game is in LOBBY state
  if (gameStatus !== "LOBBY") {
    return {
      valid: false,
      reason: `Cannot start game in '${gameStatus}' state`,
    };
  }

  // Validate minimum players
  if (players.length < 4) {
    return {
      valid: false,
      reason: "Cannot start game with less than 4 players",
    };
  }

  // Get unique team IDs and ensure we have at least two teams
  const teamIds = [...new Set(players.map((player) => player._teamId))];
  if (teamIds.length < 2) {
    return {
      valid: false,
      reason: "Cannot start game with less than 2 teams",
    };
  }

  // Ensure each team has at least 2 players
  const playersPerTeam = teamIds.map(
    (teamId) => players.filter((player) => player._teamId === teamId).length,
  );

  if (playersPerTeam.some((count) => count < 2)) {
    return {
      valid: false,
      reason: "Each team must have at least 2 players",
    };
  }

  // All validations passed
  return {
    valid: true,
  };
}
