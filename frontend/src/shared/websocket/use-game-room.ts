import { useEffect, useRef } from "react";
import { useWebSocket } from "./websocket-context";
import { WebSocketEvent } from "./websocket-events.types";

/**
 * Joins the per-game websocket room and tears it down on unmount.
 *
 * Idempotent — re-running with the same `gameId` is a no-op; a new
 * `gameId` leaves the previous room before joining the new one.
 * Passing `null` skips joining entirely.
 */
export const useGameRoom = (gameId: string | null) => {
  const { socket, isConnected } = useWebSocket();
  const currentGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) {
      return;
    }

    /** If we're already in this room, don't rejoin */
    if (currentGameIdRef.current === gameId) {
      return;
    }

    /** Leave previous room if we were in one */
    if (currentGameIdRef.current) {
      console.log(`Leaving game room: ${currentGameIdRef.current}`);
      socket.emit(WebSocketEvent.LEAVE_GAME, currentGameIdRef.current);
    }

    /** Join new room */
    console.log(`Joining game room: ${gameId}`);
    socket.emit(WebSocketEvent.JOIN_GAME, gameId);
    currentGameIdRef.current = gameId;

    /** Cleanup: leave room on unmount or when gameId changes */
    return () => {
      if (currentGameIdRef.current) {
        console.log(`Leaving game room (cleanup): ${currentGameIdRef.current}`);
        socket.emit(WebSocketEvent.LEAVE_GAME, currentGameIdRef.current);
        currentGameIdRef.current = null;
      }
    };
  }, [socket, isConnected, gameId]);

  return {
    currentGameId: currentGameIdRef.current,
    isInRoom: currentGameIdRef.current === gameId && isConnected,
  };
};
