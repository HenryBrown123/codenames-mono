import React from "react";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface CodebreakerActionsPanelViewProps {
  isLoading: boolean;
  onEndTurn: () => void;
}

export const CodebreakerActionsPanelView: React.FC<CodebreakerActionsPanelViewProps> = ({
  isLoading,
  onEndTurn,
}) => {
  return (
    <TerminalSection>
      <ActionButton
        onClick={onEndTurn}
        text={isLoading ? "PROCESSING..." : "END TRANSMISSION"}
        enabled={!isLoading}
      />
    </TerminalSection>
  );
};

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const CodebreakerActionsPanel: React.FC = () => {
  const { endTurn, actionState } = useGameActions();

  return (
    <CodebreakerActionsPanelView
      isLoading={actionState.status === "loading"}
      onEndTurn={endTurn}
    />
  );
};
