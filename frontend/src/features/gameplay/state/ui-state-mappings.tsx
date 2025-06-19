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
import { TurnData } from "../api/queries/use-turn-query";
import { BoardMode, BOARD_MODE } from "../ui/game-board/game-board";
import {
  GAME_TYPE,
  PLAYER_ROLE,
  CODEBREAKER_OUTCOME,
} from "@codenames/shared/types";

/**
 * Helper to get outcome message based on guess result
 */
const getOutcomeMessage = (outcome: string): string => {
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
      return "Turn ended";
  }
};

/**
 * Messages - activeTurn passed as prop from useTurn hook
 */
export const messages: Record<
  string,
  (gameData: GameData, activeTurn: TurnData | null) => string
> = {
  // Lobby
  "lobby.waiting": (gameData, activeTurn) => `Welcome! Ready to start?`,

  // Dealing
  "dealing.inProgress": (gameData, activeTurn) => `Dealing cards...`,

  // Spectator
  "spectator.watching": (gameData, activeTurn) => {
    return `Watching • ${activeTurn?.teamName || "No active turn"}`;
  },

  // Codemaster
  "codemaster.main": (gameData, activeTurn) =>
    `${gameData.playerContext.teamName} Codemaster • Give your clue`,

  "codemaster.waiting": (gameData, activeTurn) =>
    `Waiting for ${gameData.playerContext.teamName} to guess...`,

  // Codebreaker
  "codebreaker.main": (gameData, activeTurn) => {
    const clue = activeTurn?.clue;

    if (!clue) {
      return `${gameData.playerContext.teamName} • Waiting for clue...`;
    }

    const remaining = activeTurn.guessesRemaining || 0;
    const guessText = remaining === 1 ? "guess" : "guesses";

    // Use clean data from backend, compute message in frontend
    if (activeTurn.hasGuesses && activeTurn.lastGuess && remaining > 0) {
      const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
      return `${outcomeMessage} • "${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
    }

    return `"${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
  },

  "codebreaker.outcome": (gameData, activeTurn) => {
    if (activeTurn?.lastGuess) {
      const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
      return `${outcomeMessage} • Your turn is over`;
    }

    return "Turn ended";
  },

  "codebreaker.waiting": (gameData, activeTurn) => `Waiting for other team...`,

  // Game over
  "gameover.main": (gameData, activeTurn) => `Game Over!`,
};

/**
 * Updated conditions using activeTurn state
 */
export const conditions: Record<
  string,
  (gameData: GameData, activeTurn: TurnData | null) => boolean
> = {
  // Turn state conditions
  codebreakerTurnEnded: (gameData, activeTurn) => {
    return activeTurn?.status === "COMPLETED" ||
      (activeTurn?.hasGuesses && activeTurn?.guessesRemaining === 0)
      ? true
      : false;
  },

  myTeamsTurn: (gameData, activeTurn) => {
    return activeTurn?.teamName === gameData.playerContext.teamName;
  },

  turnInProgress: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE";
  },

  waitingForClue: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE" && !activeTurn?.clue;
  },

  waitingForGuess: (gameData, activeTurn) => {
    return activeTurn?.status === "ACTIVE" &&
      activeTurn?.clue &&
      !activeTurn?.hasGuesses
      ? true
      : false;
  },

  // Game state conditions (unchanged)
  gameEnded: (gameData) => gameData.status === "COMPLETED",
  roundCompleted: (gameData) => gameData.currentRound?.status === "COMPLETED",
  singleDeviceMode: (gameData) => gameData.gameType === GAME_TYPE.SINGLE_DEVICE,
  "!singleDeviceMode": (gameData) =>
    gameData.gameType !== GAME_TYPE.SINGLE_DEVICE,
  "!roundCompleted": (gameData) =>
    gameData.currentRound?.status !== "COMPLETED",
};

/**
 * Dashboard components mapping
 */
export const dashboards: Record<string, React.ComponentType> = {
  lobbyDashboard: LobbyDashboardView,
  spectatorDashboard: SpectatorDashboardView,
  dealingDashboard: DealingDashboardView,
  codemasterDashboard: CodemasterDashboardView,
  codebreakerDashboard: CodebreakerDashboardView,
  waitingDashboard: WaitingDashboardView,
  gameoverDashboard: GameoverDashboardView,
  outcomeDashboard: OutcomeDashboardView,
};

/**
 * Game board components mapping
 */
export const gameBoards: Record<string, React.ComponentType<any>> = {
  main: GameBoardView,
};

/**
 * Board mode interactivity mapping
 */
export const boardModeInteractivity: Record<BoardMode, boolean> = {
  [BOARD_MODE.CODEMASTER_ACTIVE]: true,
  [BOARD_MODE.CODEMASTER_READONLY]: false,
  [BOARD_MODE.CODEBREAKER]: true,
  [BOARD_MODE.SPECTATOR]: false,
};
