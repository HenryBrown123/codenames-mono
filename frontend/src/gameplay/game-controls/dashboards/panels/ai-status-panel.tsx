import React from "react";
import { useGameDataRequired } from "../../../game-data/providers";
import { AiStatusIndicator, AiStatusIndicatorView } from "@frontend/ai/components";
import { GameChatLog, GameChatLogView } from "@frontend/chat/components";
import type { AiStatus } from "@frontend/ai/api";
import type { GameMessage } from "@frontend/chat/api";
import { TerminalSection, TerminalCommand } from "../shared";

// ============================================================================
// PRESENTATIONAL COMPONENT - Pure, no API hooks
// ============================================================================

export interface AIStatusPanelViewProps {
  aiStatus: AiStatus | null;
  messages: GameMessage[] | null;
  isPending?: boolean;
  onTrigger?: () => void;
}

/**
 * AI Status Panel View - Pure presentational component
 * Shows AI assistant status and chat log with mock data support.
 */
export const AIStatusPanelView: React.FC<AIStatusPanelViewProps> = ({
  aiStatus,
  messages,
  isPending = false,
  onTrigger,
}) => {
  return (
    <TerminalSection>
      <TerminalCommand>AI ASSISTANT</TerminalCommand>
      <AiStatusIndicatorView aiStatus={aiStatus} isPending={isPending} onTrigger={onTrigger} />
      <GameChatLogView messages={messages} />
    </TerminalSection>
  );
};

// ============================================================================
// CONNECTED COMPONENT - Fetches data via child components
// ============================================================================

/**
 * AI Status Panel - Connected component that uses API hooks.
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
