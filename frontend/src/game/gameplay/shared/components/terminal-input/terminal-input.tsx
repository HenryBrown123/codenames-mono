import React, { forwardRef } from "react";
import styles from "./terminal-input.module.css";

export interface TerminalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Show error styling (orange border). */
  error?: boolean;
  /** Preserve mixed case instead of forcing uppercase. Default: false (uppercase). */
  preserveCase?: boolean;
}

/**
 * Minimal text input styled to match the terminal/HUD aesthetic.
 * Transparent background, bottom-line border, green monospace text.
 * Uppercase by default; set preserveCase for mixed-case inputs (e.g. player names).
 *
 * Used by: codeword input, operative name input, and anywhere a
 * single-line text field is needed in the terminal UI.
 */
export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ error, preserveCase, ...props }, ref) => (
    <input
      ref={ref}
      className={styles.input}
      data-error={error || undefined}
      data-preserve-case={preserveCase || undefined}
      {...props}
    />
  ),
);

TerminalInput.displayName = "TerminalInput";
