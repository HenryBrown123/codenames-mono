/**
 * Sandbox Panel Components
 *
 * These panels use the View components with mock data
 * instead of making API calls.
 */

import React from "react";
import { AIStatusPanelView } from "../gameplay/game-controls/dashboards/panels";
import type { AiStatus } from "@frontend/ai/api";
import type { GameMessage } from "@frontend/chat/api";

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_AI_STATUS: AiStatus = {
  available: true,
  thinking: false,
};

const MOCK_MESSAGES: GameMessage[] = [
  {
    id: "mock-msg-1",
    gameId: 1,
    playerId: null,
    playerName: null,
    teamId: null,
    teamName: "Red",
    teamOnly: false,
    messageType: "AI_THINKING",
    content: "Analyzing the board for optimal clue selection...",
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// SANDBOX AI STATUS PANEL
// ============================================================================

/**
 * Sandbox version of AI Status Panel that uses mock data.
 */
export const SandboxAIStatusPanel: React.FC = () => {
  return (
    <AIStatusPanelView
      aiStatus={MOCK_AI_STATUS}
      messages={MOCK_MESSAGES}
      isPending={false}
      onTrigger={() => console.log("[Sandbox] AI trigger clicked")}
    />
  );
};
