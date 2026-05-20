import { useEffect, useCallback, useState } from "react";
import { useWebSocket } from "@frontend/shared/websocket";
import { WebSocketEvent } from "@frontend/shared/websocket/websocket-events.types";
import { useGameMessages } from "./use-game-messages";

/**
 * Tracks unread chat-message count for the badge on the chat FAB.
 *
 * On first mount with `chatOpen=false`, seeds the count to the total
 * message list length — so a page refresh still surfaces the
 * notification dot. Increments on each live `GAME_MESSAGE_CREATED`
 * websocket event while chat is closed, and resets to 0 whenever
 * `chatOpen` becomes true.
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
