import React from "react";
import { TerminalInput } from "@frontend/gameplay/shared/components";
import styles from "../lobby.module.css";

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
  placeholder = "ENTER OPERATIVE NAME",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className={styles.addPlayerArea}>
      <TerminalInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        preserveCase
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
