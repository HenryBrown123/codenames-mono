import React from "react";
import {
  LobbyDashboardView,
  SpectatorDashboardView,
  DealingDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  WaitingDashboardView,
  GameoverDashboardView,
  OutcomeDashboardView,
} from "@frontend/features/gameplay/ui/dashboard";
import { GameBoardView } from "@frontend/features/gameplay/ui/game-board/game-board";
import { GameData } from "@frontend/shared-types";
import { BoardMode, BOARD_MODE } from "../ui/game-board/game-board";
import {
  GAME_TYPE,
  PLAYER_ROLE,
  CODEBREAKER_OUTCOME,
} from "@codenames/shared/types";

/**
 * Messages including dealing scene
 */
export const messages: Record<string, (gameData: GameData) => string> = {
  // Lobby
  "lobby.waiting": () => `Welcome! Ready to start?`,

  // Dealing
  "dealing.inProgress": () => `Dealing cards...`,

  // Spectator
  "spectator.watching": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    return `Watching • ${activeTurn?.teamName || "No active turn"}`;
  },

  // Codemaster
  "codemaster.main": (gameData) =>
    `${gameData.playerContext.teamName} Codemaster • Give your clue`,

  "codemaster.waiting": (gameData) =>
    `Waiting for ${gameData.playerContext.teamName} to guess...`,

  // Codebreaker
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

    // Check if there's a recent guess to show outcome feedback
    const recentGuess =
      activeTurn?.guesses && activeTurn.guesses.length > 0
        ? activeTurn.guesses[activeTurn.guesses.length - 1]
        : null;

    if (recentGuess?.outcome && remaining > 0) {
      const outcomeMessage = getOutcomeMessage(recentGuess.outcome);
      return `${outcomeMessage} • "${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
    }

    return `"${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
  },

  "codebreaker.outcome": (gameData) => {
    const lastGuess = getLastGuess(gameData);
    if (!lastGuess?.outcome) {
      return "Turn ended";
    }

    const outcomeMessage = getOutcomeMessage(lastGuess.outcome);
    return `${outcomeMessage} • Your turn is over`;
  },

  "codebreaker.waiting": () => `Waiting for other team...`,

  // Game over
  "gameover.main": () => `Game Over!`,
};

/**
 * Helper to get the last guess made
 */
const getLastGuess = (gameData: GameData) => {
  const activeTurn = gameData.currentRound?.turns?.find(
    (t) => t.status === "ACTIVE" || t.status === "COMPLETED",
  );

  if (!activeTurn?.guesses || activeTurn.guesses.length === 0) {
    return null;
  }

  return activeTurn.guesses[activeTurn.guesses.length - 1];
};

/**
 * Helper to get outcome message based on guess result
 */
const getOutcomeMessage = (outcome: string): string => {
  console.log("Outcome received:", outcome, "Type:", typeof outcome);

  switch (outcome) {
    case CODEBREAKER_OUTCOME.CORRECT_TEAM_CARD:
      return "Good guess!";
    case CODEBREAKER_OUTCOME.OTHER_TEAM_CARD:
      return "Oops! That's the other team's card";
    case CODEBREAKER_OUTCOME.BYSTANDER_CARD:
      return "Neutral card - turn over";
    case CODEBREAKER_OUTCOME.ASSASSIN_CARD:
      return "Assassin! Game over";
    default:
      console.log("Unknown outcome, falling back to default");
      return "Turn ended";
  }
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
    return gameData.playerContext.role !== PLAYER_ROLE.CODEBREAKER;
  },

  "!codebreakerTurnEnded": (gameData) => {
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
  React.FC<{ boardMode: BoardMode; interactive?: boolean }>
> = {
  main: GameBoardView,
};

/**
 * Dashboard component mappings
 */
export const dashboards: Record<string, React.FC> = {
  lobbyDashboard: LobbyDashboardView,
  dealingDashboard: DealingDashboardView,
  spectatorDashboard: SpectatorDashboardView,
  codemasterDashboard: CodemasterDashboardView,
  codebreakerDashboard: CodebreakerDashboardView,
  waitingDashboard: WaitingDashboardView,
  gameoverDashboard: GameoverDashboardView,
  outcomeDashboard: OutcomeDashboardView,
};
