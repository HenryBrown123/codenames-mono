import React from "react";
import {
  LobbyDashboard,
  SpectatorDashboard,
  CodemasterDashboard,
  CodebreakerDashboard,
  WaitingDashboard,
  OutcomeDashboard,
  HandoffDashboard,
  GameoverDashboard,
} from "../game-controls/dashboards";
import { SpymasterBoard, SpectatorBoard, CodebreakerBoard } from "../game-board/boards";

/**
 * Maps scene keys to dashboard components
 * Handles both uppercase and lowercase role names for consistency
 */
export const getDashboardComponent = (
  role: string,
  scene: string,
  gameData?: any,
): React.ComponentType<{ messageText?: string; onOpenCluePanel?: () => void }> => {
  // Check for game over first - takes precedence over role/scene
  if (gameData?.currentRound?.status === "COMPLETED") {
    return GameoverDashboard;
  }

  // Normalize to lowercase for consistent mapping
  const normalizedRole = role.toLowerCase();
  const sceneKey = `${normalizedRole}.${scene}`;

  console.log("scene key", sceneKey);

  switch (sceneKey) {
    case "codebreaker.main":
      return CodebreakerDashboard;
    case "codebreaker.outcome":
      return OutcomeDashboard;
    case "codebreaker.waiting":
      return WaitingDashboard;
    case "codemaster.main":
      return CodemasterDashboard;
    case "codemaster.waiting":
      return WaitingDashboard;
    case "spectator.watching":
      return SpectatorDashboard;
    case "none.lobby":
    case "none.dealing":
    case "none.gameover":
      return LobbyDashboard;
    case "none.handoff":
      return HandoffDashboard; // Blank dashboard during device handoff
    default:
      console.warn(
        `No dashboard component found for ${sceneKey}, falling back to SpectatorDashboard`,
      );
      return SpectatorDashboard; // FIXED: removed View suffix
  }
};

/**
 * Maps role to board component - boards persist across scenes within a role
 */
export const getBoardComponent = (role: string, scene?: string): React.ComponentType<{ scene?: string }> => {
  const normalizedRole = role.toLowerCase();

  // During dealing phase (setup), everyone should see spectator board (clean view, no overlays)
  if (scene === "dealing") {
    return SpectatorBoard;
  }

  // Return board based on role only - same board for all scenes within a role
  switch (normalizedRole) {
    case "codebreaker":
      return CodebreakerBoard;
    case "codemaster":
      return SpymasterBoard;
    case "spectator":
      return SpectatorBoard;
    case "none":
    default:
      // Lobby/setup scenes don't need overlay
      return SpectatorBoard;
  }
};
