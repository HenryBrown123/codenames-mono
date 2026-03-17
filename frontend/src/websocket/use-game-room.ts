import { useEffect, useRef } from "react";
import { useWebSocket } from "./websocket-context";
import { WebSocketEvent } from "./websocket-events.types";

/**
 * Hook to automatically join and leave game rooms
 *
 * @param gameId - The game ID to join (null to not join any room)
 * @returns Object with current room status
 */
export const useGameRoom = (gameId: string | null) => {
  const { socket, isConnected } = useWebSocket();
  const currentGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) {
      return;
    }

    // If we're already in this room, don't rejoin
    if (currentGameIdRef.current === gameId) {
      return;
    }

    // Leave previous room if we were in one
    if (currentGameIdRef.current) {
      console.log(`Leaving game room: ${currentGameIdRef.current}`);
      socket.emit(WebSocketEvent.LEAVE_GAME, currentGameIdRef.current);
    }

    // Join new room
    console.log(`Joining game room: ${gameId}`);
    socket.emit(WebSocketEvent.JOIN_GAME, gameId);
    currentGameIdRef.current = gameId;

    // Cleanup: leave room on unmount or when gameId changes
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
