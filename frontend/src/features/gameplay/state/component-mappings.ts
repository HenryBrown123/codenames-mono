import React from "react";
import {
  LobbyDashboardView,
  SpectatorDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  WaitingDashboardView,
  OutcomeDashboardView,
} from "@frontend/features/gameplay/ui/dashboard";
import {
  CodebreakerBoard,
  CodemasterBoard,
  SpectatorBoard,
} from "../ui/game-board/game-board";

/**
 * Maps scene keys to dashboard components
 */
export const getDashboardComponent = (
  role: string,
  scene: string,
): React.ComponentType<any> => {
  const sceneKey = `${role}.${scene}`;

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
    // Handle both lowercase and uppercase NONE role
    case "none.lobby":
    case "NONE.lobby":
    case "none.dealing":
    case "NONE.dealing":
    case "none.gameover":
    case "NONE.gameover":
      return LobbyDashboardView;
    default:
      console.warn(`No dashboard component found for ${sceneKey}`);
      return SpectatorDashboardView;
  }
};

/**
 * Maps scene keys to board components
 */
export const getBoardComponent = (
  role: string,
  scene: string,
): React.ComponentType<any> => {
  const sceneKey = `${role}.${scene}`;

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
    case "NONE.lobby":
    case "none.dealing":
    case "NONE.dealing":
    case "none.gameover":
    case "NONE.gameover":
    default:
      return SpectatorBoard;
  }
};
