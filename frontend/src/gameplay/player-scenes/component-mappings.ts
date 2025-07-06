import React from "react";
import {
  LobbyDashboard as LobbyDashboardView,
  SpectatorDashboard as SpectatorDashboardView,
  CodemasterDashboard as CodemasterDashboardView,
  CodebreakerDashboard as CodebreakerDashboardView,
  WaitingDashboard as WaitingDashboardView,
  OutcomeDashboard as OutcomeDashboardView,
} from "../ui-components/dashboards";
import {
  InteractiveBoard,
  ViewOnlyBoard,
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
      return CodebreakerDashboardView;
    case "codebreaker.outcome":
      return OutcomeDashboardView;
    case "codebreaker.waiting":
      return WaitingDashboardView;
    case "codemaster.main":
      return CodemasterDashboardView;
    case "codemaster.waiting":
      return WaitingDashboardView;
    case "spectator.watching":
      return SpectatorDashboardView;
    case "none.lobby":
    case "none.dealing":
    case "none.gameover":
      return LobbyDashboardView;
    default:
      console.warn(
        `No dashboard component found for ${sceneKey}, falling back to SpectatorDashboardView`,
      );
      return SpectatorDashboardView;
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
      return InteractiveBoard;
    case 'codemaster':
    case 'spectator':
    case 'none':
    default:
      return ViewOnlyBoard;
  }
};