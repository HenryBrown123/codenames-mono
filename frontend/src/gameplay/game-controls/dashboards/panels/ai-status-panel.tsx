import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { AiStatusIndicator } from "@frontend/ai/components";
import { GameChatLog } from "@frontend/chat/components";
import { TerminalSection, TerminalCommand } from "../shared";

/**
 * Panel showing AI thinking status and chat history
 */

export interface AIStatusPanelViewProps {
  gameId: string;
}

export const AIStatusPanelView: React.FC<AIStatusPanelViewProps> = ({ gameId }) => (
  <TerminalSection>
    <TerminalCommand>AI ASSISTANT</TerminalCommand>
    <AiStatusIndicator gameId={gameId} />
    <GameChatLog gameId={gameId} />
  </TerminalSection>
);

export const AIStatusPanel: React.FC = () => {
  const { gameData } = useGameDataRequired();

  return <AIStatusPanelView gameId={gameData.publicId} />;
};
