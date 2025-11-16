/**
 * Service for creating AI bot players
 */

import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import { randomUUID } from "crypto";

export type CreateAIBotInput = {
  gameId: string; // Public game ID
  botName: string;
  teamName: "RED" | "BLUE";
};

export type CreateAIBotResult =
  | {
      success: true;
      bot: {
        playerId: string;
        botName: string;
        teamName: string;
        userId: number;
      };
    }
  | {
      success: false;
      error: string;
    };

export const createAIBotService = (db: Kysely<DB>) => {
  return async (input: CreateAIBotInput): Promise<CreateAIBotResult> => {
    try {
      // Find the game
      const game = await db
        .selectFrom("games")
        .select("id")
        .where("public_id", "=", input.gameId)
        .executeTakeFirst();

      if (!game) {
        return {
          success: false,
          error: "Game not found",
        };
      }

      // Find the team
      const team = await db
        .selectFrom("teams")
        .select("id")
        .where("game_id", "=", game.id)
        .where("team_name", "=", input.teamName)
        .executeTakeFirst();

      if (!team) {
        return {
          success: false,
          error: `Team ${input.teamName} not found`,
        };
      }

      // Create a user for the bot
      const user = await db
        .insertInto("users")
        .values({
          username: `AI-Bot-${randomUUID().slice(0, 8)}`,
          created_at: new Date(),
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      // Create the player marked as AI
      const player = await db
        .insertInto("players")
        .values({
          public_id: randomUUID(),
          user_id: user.id,
          game_id: game.id,
          public_name: input.botName,
          team_id: team.id,
          status_id: 1, // Active status
          is_ai: true,
          updated_at: new Date(),
        })
        .returning(["public_id", "public_name", "user_id"])
        .executeTakeFirstOrThrow();

      return {
        success: true,
        bot: {
          playerId: player.public_id,
          botName: player.public_name,
          teamName: input.teamName,
          userId: player.user_id,
        },
      };
    } catch (error) {
      console.error("Failed to create AI bot:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
};
