/**
 * Helper for creating AI bots when starting a game in AI mode
 */

import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import type { LobbyAggregate } from "../state/lobby-state.types";
import { lobbyHelpers } from "../state/lobby-state.helpers";
import type { TransactionalHandler } from "@backend/common/data-access/transaction-handler";
import type { LobbyOperations } from "../lobby-actions";

export type CreateAIBotsInput = {
  lobby: LobbyAggregate;
  lobbyHandler: TransactionalHandler<LobbyOperations>;
  db: Kysely<DB>;
};

/**
 * Creates AI bot users and adds them as players to fill teams
 */
export const createAIBotsForTeams = async (input: CreateAIBotsInput): Promise<void> => {
  const { lobby, lobbyHandler, db } = input;

  for (const team of lobby.teams) {
    const playersNeeded = 2 - team.players.length;

    if (playersNeeded <= 0) {
      continue;
    }

    console.log(`[AI Mode] Adding ${playersNeeded} AI bot(s) to ${team.teamName}`);

    // Create AI bot users
    const botUsers: Array<{ userId: number; botName: string }> = [];
    for (let i = 0; i < playersNeeded; i++) {
      const botUser = await db
        .insertInto("users")
        .values({
          username: `AI-Bot-${team.teamName}-${Date.now()}-${i}`,
          created_at: new Date(),
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      botUsers.push({
        userId: botUser.id,
        botName: `AI-${team.teamName.replace("Team ", "")}-Bot${i + 1}`,
      });
    }

    // Add AI bots as players using the standard flow
    await lobbyHandler(async (lobbyOps) => {
      const teamNameToIdMap = lobbyHelpers.getTeamNameToIdMap(lobby);
      const teamId = teamNameToIdMap.get(team.teamName);

      if (!teamId) {
        throw new Error(`Team ${team.teamName} not found`);
      }

      const playerInputs = botUsers.map((bot) => ({
        userId: bot.userId,
        gameId: lobby._id,
        teamId,
        publicName: bot.botName,
        statusId: 1,
        isAi: true, // ← This is the key difference!
      }));

      await lobbyOps.addPlayers(playerInputs);
    });
  }
};
