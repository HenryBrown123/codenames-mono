import React from "react";
import {
  LobbyDashboardView,
  SpectatorDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  WaitingDashboardView,
  OutcomeDashboardView,
} from "@frontend/gameplay/dashboard";
import {
  CodebreakerBoard,
  CodemasterBoard,
  SpectatorBoard,
} from "@frontend/gameplay/game-board";

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

  //console.log(
  //  `[COMPONENT_MAPPINGS] Looking up dashboard for: ${sceneKey} (original: ${role}.${scene})`,
  //);

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
 * Maps scene keys to board components
 * Now returns components that expect visibility control props
 */
export const getBoardComponent = (
  role: string,
  scene: string,
): React.ComponentType<{ showOnMount?: boolean; onResetVisibility?: () => void }> => {
  // Normalize to lowercase for consistent mapping
  const normalizedRole = role.toLowerCase();
  const sceneKey = `${normalizedRole}.${scene}`;

  //   console.log(
  //     `[COMPONENT_MAPPINGS] Looking up board for: ${sceneKey} (original: ${role}.${scene})`,
  //   );

  switch (sceneKey) {
    case "codebreaker.main":
      return CodebreakerBoard;
    case "codemaster.main":
      return CodemasterBoard;
    case "codebreaker.outcome":
    case "codebreaker.waiting":
    case "codemaster.waiting":
    case "spectator.watching":
    case "none.lobby":
    case "none.dealing":
    case "none.gameover":
    default:
      return SpectatorBoard;
  }
};
