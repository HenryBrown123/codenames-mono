import {
  PlayerRole,
  PLAYER_ROLE,
  GameState,
  GAME_STATE,
} from "@codenames/shared/types";
import {
  BoardMode,
  BOARD_MODE,
} from "@frontend/features/gameplay/ui/game-board/game-board";

/**
 * The central UI configuration for the game.
 * Enhanced with role transitions for single device mode using array conditions.
 */
export const uiConfig: UIConfig = {
  // When player has no role or game is in lobby
  [PLAYER_ROLE.NONE]: {
    initial: "lobby",
    scenes: {
      lobby: {
        message: "lobby.waiting",
        gameBoard: "main",
        dashboard: "lobbyDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
        on: {
          GAME_STARTED: [
            {
              condition: ["singleDeviceMode"],
              type: "role",
              target: PLAYER_ROLE.CODEMASTER,
            },
            {
              condition: ["!singleDeviceMode"],
              type: "role",
              target: "serverRole",
            },
          ],
        },
      },
      gameover: {
        message: "gameover.main",
        gameBoard: "main",
        dashboard: "gameoverDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
      },
    },
  },

  // When player is a spectator
  [PLAYER_ROLE.SPECTATOR]: {
    initial: "watching",
    scenes: {
      watching: {
        message: "spectator.watching",
        gameBoard: "main",
        dashboard: "spectatorDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
      },
    },
  },

  // When player is the codemaster
  [PLAYER_ROLE.CODEMASTER]: {
    initial: "entry",
    scenes: {
      entry: {
        message: "codemaster.entry",
        gameBoard: "main",
        dashboard: "transitionDashboard",
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
        on: {
          next: { type: "scene", target: "preparation" },
        },
      },
      preparation: {
        message: "codemaster.preparation",
        gameBoard: "main",
        dashboard: "transitionDashboard",
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
        on: {
          next: { type: "scene", target: "main" },
        },
      },
      main: {
        message: "codemaster.main",
        gameBoard: "main",
        dashboard: "codemasterDashboard",
        boardMode: BOARD_MODE.CODEMASTER_ACTIVE,
        on: {
          CLUE_SUBMITTED: [
            {
              condition: ["singleDeviceMode"],
              type: "role",
              target: PLAYER_ROLE.CODEBREAKER,
            },
            {
              condition: ["!singleDeviceMode"],
              type: "role",
              target: "serverRole",
            },
            {
              type: "scene",
              target: "waiting",
            },
          ],
        },
      },
      waiting: {
        message: "codemaster.waiting",
        gameBoard: "main",
        dashboard: "waitingDashboard",
        boardMode: BOARD_MODE.CODEMASTER_ACTIVE,
        on: {
          TURN_CHANGED: [
            {
              condition: ["singleDeviceMode"],
              type: "role",
              target: PLAYER_ROLE.CODEMASTER,
            },
            {
              condition: ["!singleDeviceMode"],
              type: "role",
              target: "serverRole",
            },
            {
              type: "scene",
              target: "preparation",
            },
          ],
        },
      },
    },
  },

  // When player is a codebreaker
  [PLAYER_ROLE.CODEBREAKER]: {
    initial: "entry",
    scenes: {
      entry: {
        message: "codebreaker.entry",
        gameBoard: "main",
        dashboard: "transitionDashboard",
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
        on: {
          next: { type: "scene", target: "preparation" },
        },
      },
      preparation: {
        message: "codebreaker.preparation",
        gameBoard: "main",
        dashboard: "transitionDashboard",
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
        on: {
          next: { type: "scene", target: "main" },
        },
      },
      main: {
        message: "codebreaker.main",
        gameBoard: "main",
        dashboard: "codebreakerDashboard",
        boardMode: BOARD_MODE.CODEBREAKER,
        on: {
          GUESS_MADE: { type: "scene", target: "outcome" },
        },
      },
      outcome: {
        message: "codebreaker.outcome",
        gameBoard: "main",
        dashboard: "transitionDashboard",
        boardMode: BOARD_MODE.CODEBREAKER,
        on: {
          next: [
            // Handle round completed cases first
            {
              condition: ["roundCompleted", "gameEnded"],
              type: "role",
              target: PLAYER_ROLE.NONE, // Takes them to gameover scene
            },
            {
              condition: ["roundCompleted", "!gameEnded"],
              type: "role",
              target: PLAYER_ROLE.NONE, // Takes them back to lobby for next round
            },

            // Handle turn ended (but round continues)
            {
              condition: ["turnEnded", "!roundCompleted", "singleDeviceMode"],
              type: "role",
              target: PLAYER_ROLE.CODEMASTER,
            },
            {
              condition: ["turnEnded", "!roundCompleted", "!singleDeviceMode"],
              type: "scene",
              target: "waiting",
            },

            // Handle opponent turn (but round continues)
            {
              condition: [
                "opponentTurn",
                "!roundCompleted",
                "singleDeviceMode",
              ],
              type: "role",
              target: PLAYER_ROLE.CODEMASTER,
            },
            {
              condition: [
                "opponentTurn",
                "!roundCompleted",
                "!singleDeviceMode",
              ],
              type: "scene",
              target: "waiting",
            },

            // Default: continue guessing (same team, turn not ended, round not completed)
            {
              type: "scene",
              target: "main",
            },
          ],
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
 * Enhanced transition configuration interface with array condition support
 */
export interface TransitionConfig {
  condition?: string | string[];
  type: "scene" | "role";
  target: string | PlayerRole | "serverRole";
}

/**
 * Scene configuration interface
 */
interface SceneConfig {
  message: string;
  gameBoard: string;
  dashboard: string;
  boardMode: BoardMode;
  on?: Record<string, TransitionConfig | TransitionConfig[]>;
}

interface StageConfig {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

type UIConfig = Record<PlayerRole, StageConfig>;
