import React from "react";
import { useGameActions } from "..";
import { ActionButton } from "../../shared/components";
import { TerminalSection } from "../shared";

/** Props for {@link CodebreakerActionsPanelView}. */
export interface CodebreakerActionsPanelViewProps {
  isLoading: boolean;
  onEndTurn: () => void;
}

/** Presentational codebreaker action row — currently the end-turn button. */
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

/** Connected codebreaker action row — bound to the game-actions provider. */
export const CodebreakerActionsPanel: React.FC = () => {
  const { endTurn, actionState } = useGameActions();

  return (
    <CodebreakerActionsPanelView
      isLoading={actionState.status === "loading"}
      onEndTurn={endTurn}
    />
  );
};
