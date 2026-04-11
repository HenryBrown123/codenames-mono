import React from "react";
import { ChatIcon, ChatNotificationIcon } from "@frontend/shared/components/icons";
import styles from "./chat-fab.module.css";

interface ChatFabProps {
  onClick: () => void;
  unreadCount: number;
}

export const ChatFab: React.FC<ChatFabProps> = ({ onClick, unreadCount }) => (
  <button type="button" className={styles.fab} onClick={onClick} aria-label="Open chat">
    {unreadCount > 0 ? <ChatNotificationIcon /> : <ChatIcon />}
  </button>
);
