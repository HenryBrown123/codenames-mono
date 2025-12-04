import React, { useState, useEffect, useRef } from "react";
import { useGameMessages } from "@frontend/chat/api";
import styles from "./game-chat-log.module.css";

/**
 * Scrollable chat log with performant typewriter effect for AI messages.
 * Uses requestAnimationFrame instead of per-character DOM nodes.
 */

export interface GameChatLogViewProps {
  messageId: string;
  content: string;
  messageType: string;
  teamName?: string;
}

export const GameChatLogView: React.FC<GameChatLogViewProps> = ({
  messageId,
  content,
  messageType,
  teamName,
}) => {
  const [displayedChars, setDisplayedChars] = useState(0);
  const prevMessageIdRef = useRef(messageId);

  // Reset animation when message changes
  useEffect(() => {
    if (messageId !== prevMessageIdRef.current) {
      setDisplayedChars(0);
      prevMessageIdRef.current = messageId;
    }
  }, [messageId]);

  // Typewriter effect using requestAnimationFrame for smooth performance
  useEffect(() => {
    if (displayedChars >= content.length) return;

    let rafId: number;
    let lastTime = 0;
    const charDelay = 20; // ms per character

    const animate = (time: number) => {
      if (time - lastTime >= charDelay) {
        setDisplayedChars((prev) => Math.min(prev + 1, content.length));
        lastTime = time;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [content.length, displayedChars]);

  const isComplete = displayedChars >= content.length;

  return (
    <div className={styles.chatLog}>
      <div className={`${styles.message} ${styles[messageType.toLowerCase()]}`}>
        <div className={styles.messageContent}>
          <span>{content.slice(0, displayedChars)}</span>
          <span className={styles.hiddenText} aria-hidden="true">
            {content.slice(displayedChars)}
          </span>
          {!isComplete && <span className={styles.cursor}>▌</span>}
        </div>
        {teamName && <div className={styles.messageTeam}>[{teamName}]</div>}
      </div>
    </div>
  );
};

const removeEmojis = (text: string): string => {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .trim();
};

interface GameChatLogProps {
  gameId: string;
}

export const GameChatLog: React.FC<GameChatLogProps> = ({ gameId }) => {
  const { data: messages, isLoading } = useGameMessages(gameId);

  if (isLoading || !messages) {
    return null;
  }

  const aiMessages = messages.filter(
    (msg) => msg.messageType === "AI_THINKING" || msg.messageType === "SYSTEM"
  );

  if (aiMessages.length === 0) {
    return null;
  }

  const latestMessage = aiMessages[aiMessages.length - 1];
  const cleanContent = removeEmojis(latestMessage.content);

  return (
    <GameChatLogView
      messageId={latestMessage.id}
      content={cleanContent}
      messageType={latestMessage.messageType}
      teamName={latestMessage.teamName ?? undefined}
    />
  );
};
