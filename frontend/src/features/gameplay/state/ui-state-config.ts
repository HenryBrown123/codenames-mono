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
 * Now based on player role + game context instead of legacy game stages.
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
    initial: "preparation",
    scenes: {
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
          CLUE_SUBMITTED: { type: "scene", target: "waiting" },
        },
      },
      waiting: {
        message: "codemaster.waiting",
        gameBoard: "main",
        dashboard: "waitingDashboard",
        boardMode: BOARD_MODE.CODEMASTER_ACTIVE,
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
            {
              condition: "turnEnded",
              type: "scene",
              target: "waiting",
            },
            {
              condition: "opponentTurn",
              type: "scene",
              target: "waiting",
            },
            {
              type: "scene",
              target: "main",
            },
          ],
        },
      },
      waiting: {
        message: "codebreaker.waiting",
        gameBoard: "main",
        dashboard: "waitingDashboard",
        boardMode: BOARD_MODE.CODEMASTER_READONLY,
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
 * Transition configuration interface
 */
interface TransitionConfig {
  condition?: string;
  type: "scene";
  target: string;
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
