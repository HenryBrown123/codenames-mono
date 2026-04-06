import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./websocket-context";
import { WebSocketEvent, EventPayload } from "./websocket-events.types";

/** All events that should trigger a full query cache invalidation. */
const INVALIDATION_EVENTS = [
  /** Lobby events */
  WebSocketEvent.PLAYER_JOINED,
  WebSocketEvent.PLAYER_LEFT,
  WebSocketEvent.PLAYER_UPDATED,
  WebSocketEvent.GAME_STARTED,
  /** Round events */
  WebSocketEvent.ROUND_CREATED,
  WebSocketEvent.ROUND_STARTED,
  WebSocketEvent.CARDS_DEALT,
  WebSocketEvent.ROUND_ENDED,
  /** Turn events */
  WebSocketEvent.TURN_STARTED,
  WebSocketEvent.CLUE_GIVEN,
  WebSocketEvent.GUESS_MADE,
  WebSocketEvent.TURN_ENDED,
  /** Game events */
  WebSocketEvent.GAME_ENDED,
  WebSocketEvent.GAME_UPDATED,
  /** AI events */
  WebSocketEvent.AI_PIPELINE_STARTED,
  WebSocketEvent.AI_PIPELINE_STAGE,
  WebSocketEvent.AI_PIPELINE_COMPLETE,
  WebSocketEvent.AI_PIPELINE_FAILED,
  /** Chat events */
  WebSocketEvent.GAME_MESSAGE_CREATED,
] as const;

/**
 * Hook to handle WebSocket events and invalidate React Query cache
 *
 * @param gameId - The game ID to listen for events on (null to not listen)
 */
export const useWebSocketInvalidation = (gameId: string | null): void => {
  const { socket, isConnected } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !gameId) {
      return;
    }

    console.log(`Setting up WebSocket event listeners for game: ${gameId}`);

    const invalidateAllQueries = () => {
      console.log(`Invalidating ALL queries for game: ${gameId}`);
      queryClient.invalidateQueries();
    };

    const handlers = INVALIDATION_EVENTS.map((event) => {
      const handler = (payload: EventPayload) => {
        console.log(`${event} event received:`, payload);
        invalidateAllQueries();
      };
      socket.on(event, handler);
      return { event, handler };
    });

    return () => {
      console.log(`Removing WebSocket event listeners for game: ${gameId}`);
      handlers.forEach(({ event, handler }) => socket.off(event, handler));
    };
  }, [socket, isConnected, gameId, queryClient]);
};
