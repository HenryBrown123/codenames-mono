import React from "react";
import { useGameActions } from "..";
import { CodeWordInput } from "./codemaster-input";
import { TerminalSection, TerminalCommand } from "../shared";

/** Props for {@link CodemasterActionsPanelView}. */
export interface CodemasterActionsPanelViewProps {
  isLoading: boolean;
  onSubmit: (word: string, count: number) => void;
}

/** Presentational codemaster action panel — wraps the clue input. */
export const CodemasterActionsPanelView: React.FC<CodemasterActionsPanelViewProps> = ({
  isLoading,
  onSubmit,
}) => (
  <TerminalSection>
    <TerminalCommand>ACTION</TerminalCommand>
    <CodeWordInput
      codeWord=""
      numberOfCards={null}
      isEditable={true}
      isLoading={isLoading}
      onSubmit={onSubmit}
    />
  </TerminalSection>
);

/** Connected codemaster action panel — bound to the game-actions provider. */
export const CodemasterActionsPanel: React.FC = () => {
  const { giveClue, actionState } = useGameActions();

  const isLoading = actionState.status === "loading";

  return <CodemasterActionsPanelView isLoading={isLoading} onSubmit={giveClue} />;
};
