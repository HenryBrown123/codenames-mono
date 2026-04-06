import { useEffect } from "react";
import { useWebSocket } from "./websocket-context";
import { WebSocketEvent } from "./websocket-events.types";

/**
 * Game events that should trigger a drawer open on mobile.
 * Only clue-related events — user wants to see the new clue.
 */
const DRAWER_TRIGGER_EVENTS = [
  WebSocketEvent.CLUE_GIVEN,
  WebSocketEvent.AI_PIPELINE_COMPLETE,
] as const;

/**
 * Hook to trigger a callback when game events occur.
 * Used by mobile scene to auto-open the dashboard drawer.
 *
 * @param gameId - The game ID to listen for events on
 * @param onGameEvent - Callback to trigger when a game event occurs
 */
export const useGameEventCallback = (
  gameId: string | null,
  onGameEvent: () => void
) => {
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected || !gameId) {
      return;
    }

    const handleEvent = () => {
      onGameEvent();
    };

    // Register listeners for all trigger events
    DRAWER_TRIGGER_EVENTS.forEach((event) => {
      socket.on(event, handleEvent);
    });

    // Cleanup
    return () => {
      DRAWER_TRIGGER_EVENTS.forEach((event) => {
        socket.off(event, handleEvent);
      });
    };
  }, [socket, isConnected, gameId, onGameEvent]);
};
