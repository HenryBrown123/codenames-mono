import React from "react";
import styles from "./ar-reveal-button.module.css";

interface ARRevealButtonProps {
  arMode: boolean;
  enabled?: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ARRevealButton: React.FC<ARRevealButtonProps> = ({
  arMode,
  enabled = true,
  onClick,
  className,
  children,
}) => {
  return (
    <button 
      className={`${styles.arButton} ${className || ""}`}
      data-ar-mode={arMode}
      data-enabled={enabled}
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
    >
      {children || (arMode ? "DISABLE AR" : "REVEAL")}
    </button>
  );
};