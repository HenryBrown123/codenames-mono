import React from "react";
import { GameDashboard } from "../game-controls/dashboards";
import { SpymasterBoard, SpectatorBoard, CodebreakerBoard } from "../game-board/boards";

/**
 * Returns the unified GameDashboard component.
 * All visibility logic is now handled by the panel config system.
 */
export const getDashboardComponent = (
  _role: string,
  _scene: string,
  _gameData?: any,
): React.ComponentType => {
  return GameDashboard;
};

/**
 * Maps role to board component - boards persist across scenes within a role
 */
export const getBoardComponent = (role: string, scene?: string): React.ComponentType => {
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
