import React from "react";
import { TerminalSection } from "../shared";
import { CodeWordInput } from "./codemaster-input";
import { useGameActions } from "..";

/**
 * Standalone clue input panel for the stacked (desktop) dashboard.
 * Only rendered when the codemaster needs to give a clue.
 */
export const ClueInputPanel: React.FC = () => {
  const { giveClue, actionState } = useGameActions();

  return (
    <TerminalSection>
      <CodeWordInput
        codeWord=""
        numberOfCards={null}
        isEditable={true}
        isLoading={actionState.status === "loading"}
        onSubmit={giveClue}
      />
    </TerminalSection>
  );
};
