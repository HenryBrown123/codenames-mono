import React from "react";
import { TerminalInput } from "@frontend/game/gameplay/shared/components";
import styles from "../layout/lobby.module.css";

export interface AddPlayerInputViewProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  teamColor: string;
  disabled?: boolean;
  placeholder?: string;
  /** HTML id prefix for the input and button (e.g. "add-player-red") */
  idPrefix?: string;
}

export const AddPlayerInputView: React.FC<AddPlayerInputViewProps> = ({
  value,
  onChange,
  onSubmit,
  teamColor,
  disabled = false,
  placeholder = "ENTER OPERATIVE NAME",
  idPrefix,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className={styles.addPlayerArea}>
      <TerminalInput
        id={idPrefix ? `${idPrefix}-input` : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        preserveCase
      />
      <button
        id={idPrefix ? `${idPrefix}-btn` : undefined}
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
