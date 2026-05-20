import React from "react";
import { useGameDataRequired } from "../../providers";
import { useStartTurnMutation } from "../../api/mutations/use-start-turn";
import { ActionButton } from "../../shared/components";
import { TerminalSection } from "../shared";

/** Props for {@link StartTurnPanelView}. */
export interface StartTurnPanelViewProps {
  isLoading: boolean;
  onStartTurn: () => void;
}

/** Presentational "Next turn" button. Stateless. */
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

/**
 * Connected start-turn panel. Calls the start-turn mutation for the
 * current round when clicked; mounted in scenes that need a manual
 * trigger between turns.
 */
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
