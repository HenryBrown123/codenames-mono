import React, { useRef, useEffect } from "react";
import { TerminalInput, CircleButton } from "@frontend/game/gameplay/shared/components";
import styles from "./compact-clue-input.module.css";

interface CompactClueInputProps {
  word: string;
  count: number;
  error: string;
  isLoading: boolean;
  onWordChange: (w: string) => void;
  onCountChange: (n: number) => void;
  onSubmit: () => void;
}

/**
 * Compact inline clue input for the intel box.
 * Layout: [CODEWORD input] [− N +]
 * No submit button — footer TRANSMIT handles that.
 */
export const CompactClueInput: React.FC<CompactClueInputProps> = ({
  word,
  count,
  error,
  isLoading,
  onWordChange,
  onCountChange,
  onSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    /** Auto-focus on mount (desktop only) */
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && word.trim() && !isLoading) {
      onSubmit();
    }
  };

  const decrement = () => onCountChange(Math.max(1, count - 1));
  const increment = () => onCountChange(Math.min(9, count + 1));

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <TerminalInput
          id="clue-word-input"
          ref={inputRef}
          value={word}
          onChange={(e) => onWordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="CODEWORD"
          autoComplete="off"
          error={!!error}
        />
        <div className={styles.countGroup}>
          <CircleButton size="sm" onClick={decrement} disabled={isLoading || count <= 1} aria-label="Decrease count">−</CircleButton>
          <span className={styles.countValue}>{count}</span>
          <CircleButton size="sm" onClick={increment} disabled={isLoading || count >= 9} aria-label="Increase count">+</CircleButton>
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
