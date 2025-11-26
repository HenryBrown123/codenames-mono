import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameMessages } from "@frontend/chat/api";
import styles from "./game-chat-log.module.css";

interface GameChatLogProps {
  gameId: string;
}

/**
 * Remove emojis from text
 */
const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
};

/**
 * Game Chat Log Component
 * Displays only the latest AI thinking message with typewriter animation
 */
export const GameChatLog: React.FC<GameChatLogProps> = ({ gameId }) => {
  const { data: messages, isLoading } = useGameMessages(gameId);

  if (isLoading || !messages) {
    return null;
  }

  // Filter to only show AI_THINKING and SYSTEM messages
  const aiMessages = messages.filter(
    (msg) => msg.messageType === "AI_THINKING" || msg.messageType === "SYSTEM"
  );

  if (aiMessages.length === 0) {
    return null;
  }

  // Get only the latest message
  const latestMessage = aiMessages[aiMessages.length - 1];
  const cleanContent = removeEmojis(latestMessage.content);

  return (
    <div className={styles.chatLog}>
      <AnimatePresence mode="wait">
        <motion.div
          key={latestMessage.id}
          className={`${styles.message} ${styles[latestMessage.messageType.toLowerCase()]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.messageContent}>
            {cleanContent.split('').map((letter, index) => (
              <motion.span
                key={`${latestMessage.id}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05, delay: index * 0.02 }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          {latestMessage.teamName && (
            <div className={styles.messageTeam}>[{latestMessage.teamName}]</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
