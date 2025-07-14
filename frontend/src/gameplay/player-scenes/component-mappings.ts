import React from "react";
import {
  LobbyDashboard,
  SpectatorDashboard,
  CodemasterDashboard,
  CodebreakerDashboard,
  WaitingDashboard,
  OutcomeDashboard,
} from "../ui-components/dashboards";
import {
  SpymasterBoard,
  SpectatorBoard,
  CodebreakerBoard,
} from "../ui-components/boards";

/**
 * Maps scene keys to dashboard components
 * Handles both uppercase and lowercase role names for consistency
 */
export const getDashboardComponent = (
  role: string,
  scene: string,
): React.ComponentType<any> => {
  // Normalize to lowercase for consistent mapping
  const normalizedRole = role.toLowerCase();
  const sceneKey = `${normalizedRole}.${scene}`;

  switch (sceneKey) {
    case "codebreaker.main":
      return CodebreakerDashboard;  // FIXED: removed View suffix
    case "codebreaker.outcome":
      return OutcomeDashboard;      // FIXED: removed View suffix
    case "codebreaker.waiting":
      return WaitingDashboard;      // FIXED: removed View suffix
    case "codemaster.main":
      return CodemasterDashboard;   // FIXED: removed View suffix
    case "codemaster.waiting":
      return WaitingDashboard;      // FIXED: removed View suffix
    case "spectator.watching":
      return SpectatorDashboard;    // FIXED: removed View suffix
    case "none.lobby":
    case "none.dealing":
    case "none.gameover":
      return LobbyDashboard;        // FIXED: removed View suffix
    default:
      console.warn(
        `No dashboard component found for ${sceneKey}, falling back to SpectatorDashboard`,
      );
      return SpectatorDashboard;    // FIXED: removed View suffix
  }
};

/**
 * Maps role to board component - boards persist across scenes within a role
 */
export const getBoardComponent = (
  role: string,
  scene: string, // Keep parameter for compatibility but don't use it
): React.ComponentType => {
  const normalizedRole = role.toLowerCase();
  
  // Return board based on role only - same board for all scenes within a role
  switch (normalizedRole) {
    case 'codebreaker':
      return CodebreakerBoard;
    case 'codemaster':
      return SpymasterBoard;
    case 'spectator':
      return SpectatorBoard;
    case 'none':
    default:
      // Lobby/setup scenes don't need overlay
      return SpectatorBoard;
  }
};