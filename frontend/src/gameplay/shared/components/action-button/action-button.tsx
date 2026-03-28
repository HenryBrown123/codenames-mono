import React from "react";
import styles from "./action-button.module.css";

export const BUTTON_VALIDATION = {
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
} as const;

export type ButtonValidation = (typeof BUTTON_VALIDATION)[keyof typeof BUTTON_VALIDATION];

type ButtonProp = {
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

const ActionButton: React.FC<ButtonProp> = ({
  text = "EXECUTE",
  enabled = true,
  onClick,
  className,
  validation,
  size = "default",
  fullWidth = false,
}) => (
  <button
    className={`${styles.button} ${size === "sm" ? styles.sm : ""} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
    onClick={enabled ? onClick : undefined}
    disabled={!enabled}
    data-validation={validation}
  >
    {text}
  </button>
);

export default ActionButton;