import React from "react";
import { CompactButton } from "@frontend/gameplay/shared/components";
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
}) => (
  <div className={styles.startButtonWrapper}>
    <CompactButton
      text="START"
      onClick={onClick}
      enabled={canStart && !isLoading}
    />
  </div>
);
