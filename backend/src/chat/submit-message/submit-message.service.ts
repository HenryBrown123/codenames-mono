import type { GameMessageData, CreateMessageInput } from "@backend/common/data-access/repositories/game-messages.repository";
import { MESSAGE_TYPE } from "@backend/common/data-access/repositories/game-messages.repository";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import { GameEventsEmitter } from "@backend/common/websocket";

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
export interface SubmitMessageServiceDeps {
  createGameMessage: (input: CreateMessageInput) => Promise<GameMessageData>;
  getGameState: GameplayStateProvider;
}

/**
 * Submit message input
 */
export interface SubmitMessageInput {
  content: string;
  teamOnly: boolean;
}

/**
 * Service result types
 */
export type SubmitMessageResult =
  | { status: "success"; message: GameMessage }
  | { status: "game-not-found"; gameId: string }
  | { status: "unauthorized"; gameId: string; userId: number }
  | { status: "invalid-input"; error: string };

/**
 * Creates the submit message service
 */
export const submitMessageService = (deps: SubmitMessageServiceDeps) =>
  async (
    gameId: string,
    userId: number,
    input: SubmitMessageInput,
  ): Promise<SubmitMessageResult> => {
    // Validate input
    if (!input.content || input.content.trim().length === 0) {
      return { status: "invalid-input", error: "Message content cannot be empty" };
    }

    if (input.content.length > 1000) {
      return { status: "invalid-input", error: "Message content cannot exceed 1000 characters" };
    }

    // Verify user has access to this game and get their team
    const gameState = await deps.getGameState(gameId, userId);

    if (gameState.status === "game-not-found") {
      return { status: "game-not-found", gameId };
    }

    if (gameState.status !== "found") {
      return { status: "unauthorized", gameId, userId };
    }

    // Find the user's player and team
    const allPlayers = gameState.data.teams.flatMap((team) => team.players);
    const userPlayer = allPlayers.find((p) => p._userId === userId);

    if (!userPlayer) {
      return { status: "unauthorized", gameId, userId };
    }

    // Create the message
    const messageData = await deps.createGameMessage({
      gameId: gameState.data._id,
      playerId: userPlayer._id,
      teamId: userPlayer._teamId,
      teamOnly: input.teamOnly,
      messageType: MESSAGE_TYPE.CHAT,
      content: input.content.trim(),
    });

    // Broadcast WebSocket event
    GameEventsEmitter.gameMessageCreated(
      gameId,
      messageData.id,
      MESSAGE_TYPE.CHAT,
      input.teamOnly ? userPlayer._teamId : undefined,
    );

    // Transform to API format
    const message: GameMessage = {
      id: messageData.id,
      gameId,
      playerId: String(messageData.player_id),
      teamId: messageData.team_id,
      teamOnly: messageData.team_only,
      messageType: messageData.message_type,
      content: messageData.content,
      createdAt: messageData.created_at.toISOString(),
    };

    return { status: "success", message };
  };
