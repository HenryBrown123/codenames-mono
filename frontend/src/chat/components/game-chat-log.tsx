import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameMessages } from "@frontend/chat/api";
import styles from "./game-chat-log.module.css";

/**
 * Scrollable chat log with typewriter effect for AI messages
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
}) => (
  <div className={styles.chatLog}>
    <AnimatePresence mode="wait">
      <motion.div
        key={messageId}
        className={`${styles.message} ${styles[messageType.toLowerCase()]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.messageContent}>
          {content.split("").map((letter, index) => (
            <motion.span
              key={`${messageId}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.05, delay: index * 0.02 }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        {teamName && <div className={styles.messageTeam}>[{teamName}]</div>}
      </motion.div>
    </AnimatePresence>
  </div>
);

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
