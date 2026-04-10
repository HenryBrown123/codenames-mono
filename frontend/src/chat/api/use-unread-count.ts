import { useEffect, useRef, useState } from "react";
import { useGameMessages } from "./use-game-messages";

/**
 * Tracks unseen chat messages for badge display.
 * Resets when `chatOpen` transitions to true.
 */
export const useUnreadCount = (gameId: string, chatOpen: boolean): number => {
  const { data: messages } = useGameMessages(gameId);
  const lastSeenRef = useRef<number>(Date.now());
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (chatOpen) {
      lastSeenRef.current = Date.now();
      setCount(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen || !messages) return;
    const unread = messages.filter(
      (m) => m.messageType === "CHAT" && new Date(m.createdAt).getTime() > lastSeenRef.current,
    ).length;
    setCount(unread);
  }, [messages, chatOpen]);

  return count;
};
