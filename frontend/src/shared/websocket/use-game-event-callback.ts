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
 * Fires `onGameEvent` when a clue-related socket event arrives.
 *
 * Listens for `CLUE_GIVEN` and `AI_PIPELINE_COMPLETE` — the events
 * worth interrupting the player for — and ignores everything else.
 * No-ops until the socket is connected and a `gameId` is supplied.
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

    /** Register listeners for all trigger events */
    DRAWER_TRIGGER_EVENTS.forEach((event) => {
      socket.on(event, handleEvent);
    });

    /** Cleanup */
    return () => {
      DRAWER_TRIGGER_EVENTS.forEach((event) => {
        socket.off(event, handleEvent);
      });
    };
  }, [socket, isConnected, gameId, onGameEvent]);
};
