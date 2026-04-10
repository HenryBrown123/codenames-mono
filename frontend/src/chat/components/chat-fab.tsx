import React from "react";
import { ChatIcon } from "@frontend/shared/components/icons";
import styles from "./chat-fab.module.css";

interface ChatFabProps {
  onClick: () => void;
  unreadCount: number;
}

export const ChatFab: React.FC<ChatFabProps> = ({ onClick, unreadCount }) => (
  <button type="button" className={styles.fab} onClick={onClick} aria-label="Open chat">
    <ChatIcon />
    {unreadCount > 0 && (
      <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
    )}
  </button>
);
