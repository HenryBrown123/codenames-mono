import React from "react";
import styles from "./chat-message.module.css";

interface ChatMessageProps {
  playerName: string | null;
  teamName: string | null;
  content: string;
  messageType: "CHAT" | "AI_THINKING" | "SYSTEM";
  isOwn: boolean;
}

const teamClass = (teamName: string | null): string => {
  const t = teamName?.toLowerCase();
  if (t === "red") return styles.authorRed;
  if (t === "blue") return styles.authorBlue;
  return "";
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  playerName,
  teamName,
  content,
  messageType,
  isOwn,
}) => {
  if (messageType === "SYSTEM") {
    return (
      <div className={`${styles.row} ${styles.rowSystem}`}>
        <div className={styles.systemText}>{content}</div>
      </div>
    );
  }

  if (messageType === "AI_THINKING") {
    return (
      <div className={`${styles.row} ${styles.rowOther}`}>
        <span className={`${styles.author} ${styles.authorAi}`}>[AI]</span>
        <div className={styles.bubble}>{content}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
      {!isOwn && (
        <span className={`${styles.author} ${teamClass(teamName)}`}>
          {playerName ?? "UNKNOWN"}
        </span>
      )}
      <div className={styles.bubble}>{content}</div>
    </div>
  );
};
