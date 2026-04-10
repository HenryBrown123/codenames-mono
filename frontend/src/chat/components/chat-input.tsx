import React, { useState } from "react";
import styles from "./chat-input.module.css";

interface ChatInputProps {
  onSend: (content: string, teamOnly: boolean) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed, false);
    setValue("");
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        maxLength={1000}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={styles.sendBtn}
        disabled={!value.trim() || isLoading}
      >
        SEND
      </button>
    </form>
  );
};
