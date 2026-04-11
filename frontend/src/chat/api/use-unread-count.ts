import { useEffect, useCallback, useState } from "react";
import { useWebSocket } from "@frontend/shared/websocket";
import { WebSocketEvent } from "@frontend/shared/websocket/websocket-events.types";
import { useGameMessages } from "./use-game-messages";

/**
 * Tracks unread chat messages.
 * - On mount: treats ALL existing messages as unread (so refresh shows notification)
 * - Live: listens for GAME_MESSAGE_CREATED WebSocket events
 * - Resets to 0 when chat opens
 */
export const useUnreadCount = (gameId: string, chatOpen: boolean): number => {
  const { socket, isConnected } = useWebSocket();
  const { data: messages } = useGameMessages(gameId);
  const [count, setCount] = useState<number | null>(null);

  // On first load, set count to total messages (treat all as unread)
  useEffect(() => {
    if (count === null && messages && messages.length > 0) {
      setCount(messages.length);
    }
  }, [messages, count]);

  // Reset when chat opens
  useEffect(() => {
    if (chatOpen) setCount(0);
  }, [chatOpen]);

  // Listen for new messages while chat is closed
  const handleMessage = useCallback(() => {
    if (!chatOpen) setCount((c) => (c ?? 0) + 1);
  }, [chatOpen]);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    socket.on(WebSocketEvent.GAME_MESSAGE_CREATED, handleMessage);
    return () => { socket.off(WebSocketEvent.GAME_MESSAGE_CREATED, handleMessage); };
  }, [socket, isConnected, gameId, handleMessage]);

  return count ?? 0;
};
