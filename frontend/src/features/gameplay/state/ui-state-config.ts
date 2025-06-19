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
 * UI configuration with card dealing flow that returns to lobby
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
              type: "scene",
              target: "dealing",
            },
          ],
          ROUND_STARTED: [
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
      dealing: {
        message: "dealing.inProgress",
        gameBoard: "main",
        dashboard: "dealingDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
        on: {
          CARDS_DEALT: [
            {
              type: "scene",
              target: "lobby",
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
    initial: "main",
    scenes: {
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
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
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
              target: "main",
            },
          ],
        },
      },
    },
  },

  // When player is a codebreaker
  [PLAYER_ROLE.CODEBREAKER]: {
    initial: "main",
    scenes: {
      main: {
        message: "codebreaker.main",
        gameBoard: "main",
        dashboard: "codebreakerDashboard",
        boardMode: BOARD_MODE.CODEBREAKER,
        on: {
          GUESS_MADE: [
            // Handle round/game end first
            {
              condition: ["roundCompleted", "gameEnded"],
              type: "role",
              target: PLAYER_ROLE.NONE,
            },
            {
              condition: ["roundCompleted", "!gameEnded"],
              type: "role",
              target: PLAYER_ROLE.NONE,
            },
            // Show outcome scene when turn ends
            {
              condition: ["codebreakerTurnEnded", "!roundCompleted"],
              type: "scene",
              target: "outcome",
            },
            // Default: stay in main (continue guessing)
            {
              type: "scene",
              target: "main",
            },
          ],
        },
      },
      outcome: {
        message: "codebreaker.outcome",
        gameBoard: "main",
        dashboard: "outcomeDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
        on: {
          OUTCOME_ACKNOWLEDGED: [
            {
              condition: ["singleDeviceMode"],
              type: "role",
              target: PLAYER_ROLE.CODEMASTER,
            },
            {
              condition: ["!singleDeviceMode"],
              type: "scene",
              target: "waiting",
            },
          ],
        },
      },
      waiting: {
        message: "codebreaker.waiting",
        gameBoard: "main",
        dashboard: "waitingDashboard",
        boardMode: BOARD_MODE.SPECTATOR,
        on: {
          TURN_CHANGED: [
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
 */
export function determineUIStage(
  gameStatus: GameState,
  playerRole: PlayerRole,
  currentRound: any,
): PlayerRole {
  if (gameStatus !== GAME_STATE.IN_PROGRESS) {
    return PLAYER_ROLE.NONE;
  }

  // If round is not in progress, stay in lobby regardless of player role
  if (!currentRound || currentRound.status !== "IN_PROGRESS") {
    return PLAYER_ROLE.NONE;
  }

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
