import React from "react";
import { ActionButton } from "@frontend/game/gameplay/shared/components";
import styles from "../layout/lobby.module.css";

/** Props for {@link StartButtonView}. */
export interface StartButtonViewProps {
  canStart: boolean;
  isLoading: boolean;
  onClick: () => void;
}

/** Lobby start button — disabled until minimum-roster requirements are met. */
export const StartButtonView: React.FC<StartButtonViewProps> = ({
  canStart,
  isLoading,
  onClick,
}) => (
  <div className={styles.startButtonWrapper}>
    <ActionButton
      id="start-game-btn"
      size="sm"
      text="START"
      onClick={onClick}
      enabled={canStart && !isLoading}
    />
  </div>
);
