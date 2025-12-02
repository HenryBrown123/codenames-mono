import React from "react";
import styles from "../lobby.module.css";

/**
 * Text input with add button for adding players to a team (single-device mode)
 */

export interface AddPlayerInputViewProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  teamColor: string;
  disabled?: boolean;
  placeholder?: string;
}

export const AddPlayerInputView: React.FC<AddPlayerInputViewProps> = ({
  value,
  onChange,
  onSubmit,
  teamColor,
  disabled = false,
  placeholder = "Enter operative name...",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className={styles.addPlayerArea}>
      <input
        className={styles.addInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className={styles.addButton}
        style={{ "--team-color": teamColor } as React.CSSProperties}
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        ADD
      </button>
    </div>
  );
};
