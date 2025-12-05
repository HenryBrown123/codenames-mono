import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { useStartTurnMutation } from "../../../game-actions/api/use-start-turn";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";
import styles from "./next-turn-panel.module.css";

/**
 * Panel for starting the next turn.
 * Appears when no active turn exists in the current round.
 */

export interface NextTurnPanelViewProps {
  isLoading: boolean;
  onStartTurn: () => void;
}

export const NextTurnPanelView: React.FC<NextTurnPanelViewProps> = ({
  isLoading,
  onStartTurn,
}) => (
  <TerminalSection>
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>MISSION CONTROL</span>
      </div>
      <div className={styles.buttonWrapper}>
        <ActionButton
          onClick={onStartTurn}
          text="START NEXT TURN"
          enabled={!isLoading}
        />
      </div>
    </div>
  </TerminalSection>
);

export const NextTurnPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  const roundNumber = gameData.currentRound?.roundNumber ?? 1;
  const startTurnMutation = useStartTurnMutation(gameData.publicId);

  const handleStartTurn = () => {
    startTurnMutation.mutate({ roundNumber });
  };

  return (
    <NextTurnPanelView
      isLoading={startTurnMutation.isPending}
      onStartTurn={handleStartTurn}
    />
  );
};
