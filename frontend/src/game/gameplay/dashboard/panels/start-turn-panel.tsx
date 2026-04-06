import React from "react";
import { useGameDataRequired } from "../../providers";
import { useStartTurnMutation } from "../../api/mutations/use-start-turn";
import { ActionButton } from "../../shared/components";
import { TerminalSection } from "../shared";

/**
 * Simple action panel for starting the next turn.
 * Shows when no active turn exists in the current round.
 */

export interface StartTurnPanelViewProps {
  isLoading: boolean;
  onStartTurn: () => void;
}

export const StartTurnPanelView: React.FC<StartTurnPanelViewProps> = ({
  isLoading,
  onStartTurn,
}) => (
  <TerminalSection>
    <ActionButton
      id="next-turn-btn"
      onClick={onStartTurn}
      text={isLoading ? "PROCESSING..." : "NEXT TURN"}
      enabled={!isLoading}
    />
  </TerminalSection>
);

export const StartTurnPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  const roundNumber = gameData.currentRound?.roundNumber ?? 1;
  const startTurnMutation = useStartTurnMutation(gameData.publicId);

  const handleStartTurn = () => {
    startTurnMutation.mutate({ roundNumber });
  };

  return (
    <StartTurnPanelView
      isLoading={startTurnMutation.isPending}
      onStartTurn={handleStartTurn}
    />
  );
};
