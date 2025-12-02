import React from "react";
import { useGameActions } from "../../../game-actions";
import { CodeWordInput } from "./codemaster-input";
import { TerminalSection, TerminalCommand } from "../shared";

/**
 * Codemaster Actions Panel - Give clue input.
 * Allows codemaster to enter and submit a clue.
 */
export const CodemasterActionsPanel: React.FC = () => {
  const { giveClue, actionState } = useGameActions();

  const handleSubmit = (word: string, count: number) => {
    giveClue(word, count);
  };

  return (
    <TerminalSection>
      <TerminalCommand>ACTION</TerminalCommand>
      <CodeWordInput
        codeWord=""
        numberOfCards={null}
        isEditable={true}
        isLoading={actionState.status === "loading"}
        onSubmit={handleSubmit}
      />
    </TerminalSection>
  );
};
