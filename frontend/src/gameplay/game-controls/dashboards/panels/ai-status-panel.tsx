import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { AiStatusIndicator } from "@frontend/ai/components";
import { GameChatLog } from "@frontend/chat/components";
import { TerminalSection, TerminalCommand } from "../shared";

/**
 * AI Status Panel - Shows AI assistant status and chat log.
 */
export const AIStatusPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  return (
    <TerminalSection>
      <TerminalCommand>AI ASSISTANT</TerminalCommand>
      <AiStatusIndicator gameId={gameData.publicId} />
      <GameChatLog gameId={gameData.publicId} />
    </TerminalSection>
  );
};
