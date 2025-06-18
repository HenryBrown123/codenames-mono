import React from "react";
import {
  LobbyDashboardView,
  SpectatorDashboardView,
  TransitionDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  WaitingDashboardView,
  GameoverDashboardView,
} from "@frontend/features/gameplay/ui/dashboard";
import { GameBoardView } from "@frontend/features/gameplay/ui/game-board/game-board";
import { GameData } from "@frontend/shared-types";
import { BoardMode, BOARD_MODE } from "../ui/game-board/game-board";
import { GAME_TYPE, PLAYER_ROLE } from "@codenames/shared/types";

/**
 * Streamlined messages - shorter and more direct
 */
export const messages: Record<string, (gameData: GameData) => string> = {
  // Lobby
  "lobby.waiting": () => `Welcome! Ready to start?`,

  // Spectator
  "spectator.watching": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    return `Watching • ${activeTurn?.teamName || "No active turn"}`;
  },

  // Codemaster - much shorter
  "codemaster.main": (gameData) =>
    `${gameData.playerContext.teamName} Codemaster • Give your clue`,

  "codemaster.waiting": (gameData) =>
    `Waiting for ${gameData.playerContext.teamName} to guess...`,

  // Codebreaker - show guesses remaining prominently
  "codebreaker.main": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    const clue = activeTurn?.clue;

    if (!clue) {
      return `${gameData.playerContext.teamName} • Waiting for clue...`;
    }

    const remaining = activeTurn.guessesRemaining || 0;
    const guessText = remaining === 1 ? "guess" : "guesses";

    return `"${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
  },

  "codebreaker.waiting": () => `Waiting for other team...`,

  // Game over
  "gameover.main": () => `Game Over!`,
};

/**
 * Interactivity mapping based on board mode
 */
export const boardModeInteractivity = {
  [BOARD_MODE.CODEMASTER_ACTIVE]: false,
  [BOARD_MODE.CODEMASTER_READONLY]: false,
  [BOARD_MODE.CODEBREAKER]: true,
  [BOARD_MODE.SPECTATOR]: false,
} as const;

/**
 * Conditional logic for state machine transitions
 */
export const conditions: Record<string, (gameData: GameData) => boolean> = {
  codebreakerTurnEnded: (gameData) => {
    console.log(gameData);
    return gameData.playerContext.role !== PLAYER_ROLE.CODEBREAKER;
  },

  "!codebreakerTurnEnded": (gameData) => {
    console.log(gameData);
    return gameData.playerContext.role === PLAYER_ROLE.CODEBREAKER;
  },

  opponentTurn: (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    return activeTurn?.teamName !== gameData.playerContext.teamName;
  },

  gameEnded: (gameData) => {
    return gameData.status === "COMPLETED";
  },

  singleDeviceMode: (gameData) => {
    return gameData.gameType === GAME_TYPE.SINGLE_DEVICE;
  },

  "!singleDeviceMode": (gameData) => {
    return gameData.gameType !== GAME_TYPE.SINGLE_DEVICE;
  },

  "!roundCompleted": (gameData) => {
    return gameData.currentRound?.status !== "COMPLETED";
  },

  roundCompleted: (gameData) => {
    return gameData.currentRound?.status === "COMPLETED";
  },
};

/**
 * Game board component mappings
 */
export const gameBoards: Record<
  string,
  React.FC<{ boardMode: BoardMode; gameData: GameData; interactive?: boolean }>
> = {
  main: GameBoardView,
};

/**
 * Dashboard component mappings
 */
export const dashboards: Record<string, React.FC> = {
  lobbyDashboard: LobbyDashboardView,
  spectatorDashboard: SpectatorDashboardView,
  transitionDashboard: TransitionDashboardView,
  codemasterDashboard: CodemasterDashboardView,
  codebreakerDashboard: CodebreakerDashboardView,
  waitingDashboard: WaitingDashboardView,
  gameoverDashboard: GameoverDashboardView,
};
