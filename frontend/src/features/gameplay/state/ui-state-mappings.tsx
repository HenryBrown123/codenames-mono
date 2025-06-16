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
import { GameBoardView } from "@frontend/features/gameplay/ui/game-board/game-board-views";
import { GameData } from "@frontend/shared-types";
import { BoardMode, BOARD_MODE } from "../ui/game-board/game-board";

/**
 * Dynamic messages based on player role and game state
 */
export const messages: Record<string, (gameData: GameData) => string> = {
  // Lobby/Waiting messages
  "lobby.waiting": (gameData) =>
    `Welcome to the game! Waiting for the game to start...`,

  // Spectator messages
  "spectator.watching": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    return `You are watching the game. Current turn: ${activeTurn?.teamName || "No active turn"}`;
  },

  // Codemaster messages
  "codemaster.preparation": (gameData) =>
    `Codemaster of ${gameData.playerContext.teamName}, your turn is starting. Get ready to give your clue...`,

  "codemaster.main": (gameData) =>
    `Codemaster of ${gameData.playerContext.teamName}, enter your codeword and the number of associated guesses. Remember, your clue must help your team find their agents without revealing the assassin or opposing agents.`,

  "codemaster.waiting": (gameData) =>
    `Clue given! Waiting for ${gameData.playerContext.teamName} codebreakers to make their guesses...`,

  // Codebreaker messages
  "codebreaker.preparation": (gameData) =>
    `Codebreakers of ${gameData.playerContext.teamName}, get ready for your turn. You'll soon be guessing words based on your codemaster's clue.`,

  "codebreaker.main": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    const clue = activeTurn?.clue;
    if (clue) {
      return `Codebreakers of ${gameData.playerContext.teamName}, your clue is "${clue.word}" for ${clue.number} cards. Pick your cards carefully!`;
    }
    return `Codebreakers of ${gameData.playerContext.teamName}, waiting for your codemaster's clue...`;
  },

  "codebreaker.outcome": (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    const lastGuess = activeTurn?.guesses?.at(-1);

    if (lastGuess) {
      return `You guessed a card - Result: ${lastGuess.outcome || "Processing..."}`;
    }
    return `Turn outcome: Review the results of the last move.`;
  },

  "codebreaker.waiting": (gameData) => `Waiting for the other team's turn...`,

  // Game over
  "gameover.main": (gameData) =>
    `Game over! Congratulations to the winning team!`,
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
  turnEnded: (gameData) => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );
    return !activeTurn || activeTurn.guessesRemaining <= 0;
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
