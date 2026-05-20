import React from "react";
import styles from "./action-button.module.css";

/** Validation states for {@link ActionButton}; drives the colour treatment. */
export const BUTTON_VALIDATION = {
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
} as const;

/** A validation state from {@link BUTTON_VALIDATION}. */
export type ButtonValidation = (typeof BUTTON_VALIDATION)[keyof typeof BUTTON_VALIDATION];

type ButtonProp = {
  id?: string;
  text?: string;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
  validation?: ButtonValidation;
  /** "sm" = fixed 180px compact button with scanline overlay */
  size?: "default" | "sm";
  /** Stretch to fill parent width (only applies to size="sm") */
  fullWidth?: boolean;
};

/**
 * Primary action button styled as a terminal "EXECUTE" control.
 *
 * Optional `validation` state colours the button (OK / WARNING /
 * ERROR) via a data attribute. The compact `sm` size is fixed-width
 * with a scanline overlay; `fullWidth` only takes effect in that
 * mode.
 */
const ActionButton: React.FC<ButtonProp> = ({
  id,
  text = "EXECUTE",
  enabled = true,
  onClick,
  className,
  validation,
  size = "default",
  fullWidth = false,
}) => (
  <button
    id={id}
    className={`${styles.button} ${size === "sm" ? styles.sm : ""} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
    onClick={enabled ? onClick : undefined}
    disabled={!enabled}
    data-validation={validation}
  >
    {text}
  </button>
);

export default ActionButton;