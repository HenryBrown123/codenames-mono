import React from "react";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";

/**
 * Action buttons for codebreaker: confirm guess, end turn
 */

export interface CodebreakerActionsPanelViewProps {
  isLoading: boolean;
  onEndTurn: () => void;
}

export const CodebreakerActionsPanelView: React.FC<CodebreakerActionsPanelViewProps> = ({
  isLoading,
  onEndTurn,
}) => (
  <TerminalSection>
    <ActionButton
      id="end-turn-btn"
      onClick={onEndTurn}
      text={isLoading ? "PROCESSING..." : "END TRANSMISSION"}
      enabled={!isLoading}
    />
  </TerminalSection>
);

export const CodebreakerActionsPanel: React.FC = () => {
  const { endTurn, actionState } = useGameActions();

  return (
    <CodebreakerActionsPanelView
      isLoading={actionState.status === "loading"}
      onEndTurn={endTurn}
    />
  );
};
