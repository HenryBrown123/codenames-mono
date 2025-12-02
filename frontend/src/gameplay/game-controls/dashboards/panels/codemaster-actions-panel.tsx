import React from "react";
import { useGameActions } from "../../../game-actions";
import { CodeWordInput } from "./codemaster-input";
import { TerminalSection, TerminalCommand } from "../shared";

/**
 * Action panel for codemaster: shows current clue or waiting state
 */

export interface CodemasterActionsPanelViewProps {
  isLoading: boolean;
  onSubmit: (word: string, count: number) => void;
}

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

export const CodemasterActionsPanel: React.FC = () => {
  const { giveClue, actionState } = useGameActions();

  const isLoading = actionState.status === "loading";

  return <CodemasterActionsPanelView isLoading={isLoading} onSubmit={giveClue} />;
};
