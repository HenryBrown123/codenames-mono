import React from "react";
import styles from "./action-button.module.css";

/**
 * Validation status for button styling
 */
export const BUTTON_VALIDATION = {
  OK: "ok",
  WARNING: "warning",
  ERROR: "error",
} as const;

export type ButtonValidation = (typeof BUTTON_VALIDATION)[keyof typeof BUTTON_VALIDATION];

/**
 * Primary action button with validation states
 */
type ButtonProp = {
  text?: string;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
  validation?: ButtonValidation;
};

const ActionButton: React.FC<ButtonProp> = ({
  text = "EXECUTE",
  enabled = true,
  onClick,
  className,
  validation,
}) => (
  <button
    className={`${styles.button} ${className || ""}`}
    onClick={enabled ? onClick : undefined}
    disabled={!enabled}
    data-validation={validation}
  >
    {text}
  </button>
);

export default ActionButton;