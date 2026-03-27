import React from "react";
import styles from "./compact-button.module.css";

export interface CompactButtonProps {
  /** Button label text. */
  text: string;
  /** Click handler. */
  onClick: () => void;
  /** Whether the button is interactive. Defaults to true. */
  enabled?: boolean;
  /** Stretch to fill parent width instead of fixed 180px. */
  fullWidth?: boolean;
  /** Additional className for positioning/sizing overrides. */
  className?: string;
}

/**
 * Compact primary action button with scanline overlay.
 *
 * Fixed 180px width, green border, uppercase mono text.
 * Used across: compact dashboard (TRANSMIT, END TURN, NEXT TURN),
 * auth page (CONNECT), lobby (START), game over (NEW GAME).
 *
 * For larger/responsive buttons in stacked dashboard panels,
 * use ActionButton instead.
 */
export const CompactButton: React.FC<CompactButtonProps> = ({
  text,
  onClick,
  enabled = true,
  fullWidth = false,
  className,
}) => (
  <button
    className={`${styles.button} ${fullWidth ? styles.fullWidth : ""} ${className ?? ""}`}
    onClick={enabled ? onClick : undefined}
    disabled={!enabled}
  >
    {text}
  </button>
);
