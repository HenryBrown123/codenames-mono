import React from "react";
import styles from "../lobby.module.css";

/**
 * Start game button - disabled until minimum player requirements are met
 */

export interface StartButtonViewProps {
  canStart: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const StartButtonView: React.FC<StartButtonViewProps> = ({
  canStart,
  isLoading,
  onClick,
}) => {
  return (
    <button
      className={styles.startButton}
      data-can-start={canStart}
      onClick={onClick}
      disabled={!canStart || isLoading}
    >
      START MISSION
    </button>
  );
};
