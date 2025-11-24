import type {
  GameMessageData,
  MessageQueryParams,
} from "@backend/common/data-access/repositories/game-messages.repository";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";

/**
 * Transformed message for API response
 */
export interface GameMessage {
  id: string;
  gameId: string;
  playerId: string | null;
  teamId: number | null;
  teamOnly: boolean;
  messageType: "CHAT" | "AI_THINKING" | "SYSTEM";
  content: string;
  createdAt: string;
}

/**
 * Dependencies required by the service
 */
export interface GetMessagesServiceDeps {
  findMessagesByGame: (params: MessageQueryParams) => Promise<GameMessageData[]>;
  getGameState: GameplayStateProvider;
}

/**
 * Query parameters
 */
export interface GetMessagesQuery {
  since?: string; // ISO timestamp
  limit?: number;
}

/**
 * Service result types
 */
export type GetMessagesResult =
  | { status: "success"; messages: GameMessage[] }
  | { status: "game-not-found"; gameId: string }
  | { status: "unauthorized"; gameId: string; userId: number };

/**
 * Creates the get messages service
 */
export const getMessagesService =
  (deps: GetMessagesServiceDeps) =>
  async (
    gameId: string,
    userId: number,
    query: GetMessagesQuery = {},
  ): Promise<GetMessagesResult> => {
    // Verify user has access to this game and get their team
    const gameState = await deps.getGameState(gameId, userId);

    if (gameState.status === "game-not-found") {
      return { status: "game-not-found", gameId };
    }

    if (gameState.status !== "found") {
      return { status: "unauthorized", gameId, userId };
    }

    // Find the user's team
    const allPlayers = gameState.data.teams.flatMap((team) => team.players);
    const userPlayer = allPlayers.find((p) => p._userId === userId);
    const userTeamId = userPlayer?._teamId || null;
    const sinceDate = query.since ? new Date(query.since) : undefined;

    // Get messages for this game
    const messageRows = await deps.findMessagesByGame({
      gameId: gameState.data._id,
      since: sinceDate,
      limit: query.limit,
      requestingTeamId: userTeamId,
    });

    // Transform to API format
    const messages: GameMessage[] = messageRows.map((row) => ({
      id: row.id,
      gameId,
      playerId: row.player_id ? String(row.player_id) : null,
      teamId: row.team_id,
      teamOnly: row.team_only,
      messageType: row.message_type,
      content: row.content,
      createdAt: row.created_at.toISOString(),
    }));

    return { status: "success", messages };
  };
