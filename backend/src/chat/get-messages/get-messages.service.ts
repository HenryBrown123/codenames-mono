import type {
  GameMessageData,
  MessageQueryParams,
} from "@backend/shared/data-access/repositories/game-messages.repository";
import type { GameplayStateProvider } from "@backend/game/gameplay/state/gameplay-state.provider";

/**
 * Transformed message for API response
 */
export interface GameMessage {
  id: string;
  gameId: string;
  /** Player public ID (UUID). Null for SYSTEM/AI messages. */
  playerId: string | null;
  playerName: string | null;
  teamName: string | null;
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

    // Build lookup map: DB player id -> player info
    const playerById = new Map(allPlayers.map((p) => [p._id, p]));

    // Transform to API format, enriching with player/team names from game state
    const messages: GameMessage[] = messageRows.map((row) => {
      const player = row.player_id != null ? playerById.get(row.player_id) : undefined;
      return {
        id: row.id,
        gameId,
        playerId: player?.publicId ?? null,
        playerName: player?.publicName ?? null,
        teamName: player?.teamName ?? null,
        teamOnly: row.team_only,
        messageType: row.message_type,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      };
    });

    return { status: "success", messages };
  };
