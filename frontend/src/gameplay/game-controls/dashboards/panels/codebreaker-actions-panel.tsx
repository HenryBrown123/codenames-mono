import React from "react";
import { useGameActions } from "../../../game-actions";
import { ActionButton } from "../../../shared/components";
import { TerminalSection } from "../shared";

/**
 * Codebreaker Actions Panel - End turn button.
 * Allows codebreaker to end their turn early.
 */
export const CodebreakerActionsPanel: React.FC = () => {
  const { endTurn, actionState } = useGameActions();

  const isLoading = actionState.status === "loading";

  return (
    <TerminalSection>
      <ActionButton
        onClick={endTurn}
        text={isLoading ? "PROCESSING..." : "END TRANSMISSION"}
        enabled={!isLoading}
      />
    </TerminalSection>
  );
};
