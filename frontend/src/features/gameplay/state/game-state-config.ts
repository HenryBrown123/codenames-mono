// frontend/src/features/gameplay/state/game-state-config.ts
import {
  PlayerRole,
  PLAYER_ROLE,
  GameState,
  GAME_STATE,
} from "@codenames/shared/types";

/**
 * The central UI configuration for the game.
 * Now based on player role + game context instead of legacy game stages.
 */
export const uiConfig: UIConfig = {
  // When player has no role or game is in lobby
  [PLAYER_ROLE.NONE]: {
    initial: "lobby",
    scenes: {
      lobby: {
        message: "lobby.waiting",
        gameBoard: "readOnlyBoard",
        dashboard: "lobbyDashboard",
      },
    },
  },

  // When player is a spectator
  [PLAYER_ROLE.SPECTATOR]: {
    initial: "watching",
    scenes: {
      watching: {
        message: "spectator.watching",
        gameBoard: "readOnlyBoard",
        dashboard: "spectatorDashboard",
      },
    },
  },

  // When player is the codemaster
  [PLAYER_ROLE.CODEMASTER]: {
    initial: "preparation",
    scenes: {
      preparation: {
        message: "codemaster.preparation",
        gameBoard: "readOnlyBoard",
        dashboard: "transitionDashboard",
        on: {
          next: { type: "scene", target: "main" },
        },
      },
      main: {
        message: "codemaster.main",
        gameBoard: "codemasterBoard",
        dashboard: "codemasterDashboard",
        on: {
          CLUE_SUBMITTED: { type: "scene", target: "waiting" },
        },
      },
      waiting: {
        message: "codemaster.waiting",
        gameBoard: "codemasterBoard",
        dashboard: "waitingDashboard",
        on: {
          TURN_CHANGED: { type: "scene", target: "preparation" },
        },
      },
    },
  },

  // When player is a codebreaker
  [PLAYER_ROLE.CODEBREAKER]: {
    initial: "preparation",
    scenes: {
      preparation: {
        message: "codebreaker.preparation",
        gameBoard: "readOnlyBoard",
        dashboard: "transitionDashboard",
        on: {
          next: { type: "scene", target: "main" },
        },
      },
      main: {
        message: "codebreaker.main",
        gameBoard: "codebreakerBoard",
        dashboard: "codebreakerDashboard",
        on: {
          GUESS_MADE: { type: "scene", target: "outcome" },
        },
      },
      outcome: {
        message: "codebreaker.outcome",
        gameBoard: "codebreakerBoard",
        dashboard: "transitionDashboard",
        on: {
          next: { type: "scene", target: "main" },
          TURN_ENDED: { type: "scene", target: "waiting" },
        },
      },
      waiting: {
        message: "codebreaker.waiting",
        gameBoard: "readOnlyBoard",
        dashboard: "waitingDashboard",
        on: {
          TURN_CHANGED: { type: "scene", target: "preparation" },
        },
      },
    },
  },
};

/**
 * Determines the appropriate UI stage based on backend game state
 * Use this manually when you want to sync UI with backend
 */
export function determineUIStage(
  gameStatus: GameState,
  playerRole: PlayerRole,
  currentRound: any,
): PlayerRole {
  // If game is not in progress, everyone sees lobby/waiting
  if (gameStatus !== GAME_STATE.IN_PROGRESS) {
    return PLAYER_ROLE.NONE;
  }

  // Return the player's actual role - this drives the UI
  return playerRole;
}

/**
 * Scene configuration interface
 */
interface SceneConfig {
  message: string;
  gameBoard: string;
  dashboard: string;
  on?: Record<string, { type: "scene"; target: string }>;
}

interface StageConfig {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

type UIConfig = Record<PlayerRole, StageConfig>;
