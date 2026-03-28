import React from "react";
import styles from "./circle-button.module.css";

interface CircleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

export const CircleButton: React.FC<CircleButtonProps> = ({
  children,
  onClick,
  disabled,
  size = "md",
  className,
  "aria-label": ariaLabel,
}) => (
  <button
    className={`${styles.circleBtn} ${size === "sm" ? styles.sm : ""} ${className ?? ""}`}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);
