import React from "react";
import { useGameActions } from "../../../game-actions";
import { CodeWordInput } from "./codemaster-input";
import { TerminalSection, TerminalCommand } from "../shared";

// ============================================================================
// PRESENTATIONAL COMPONENT
// ============================================================================

export interface CodemasterActionsPanelViewProps {
  isLoading: boolean;
  onSubmit: (word: string, count: number) => void;
}

export const CodemasterActionsPanelView: React.FC<CodemasterActionsPanelViewProps> = ({
  isLoading,
  onSubmit,
}) => {
  return (
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
};

// ============================================================================
// CONNECTED COMPONENT
// ============================================================================

export const CodemasterActionsPanel: React.FC = () => {
  const { giveClue, actionState } = useGameActions();

  const handleSubmit = (word: string, count: number) => {
    giveClue(word, count);
  };

  return (
    <CodemasterActionsPanelView
      isLoading={actionState.status === "loading"}
      onSubmit={handleSubmit}
    />
  );
};
