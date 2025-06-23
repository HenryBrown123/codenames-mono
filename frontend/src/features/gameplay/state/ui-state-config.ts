import { PLAYER_ROLE } from "@codenames/shared/types";

interface StateTransition {
  condition?: string | string[];
  type: "scene" | "END";
  target?: string;
}

interface SceneConfig {
  message: string;
  gameBoard: string;
  dashboard: string;
  on?: Record<string, StateTransition | StateTransition[]>;
}

interface StateMachine {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

/**
 * Codebreaker state machine - handles guessing flow
 */
export const createCodebreakerStateMachine = (
  onEnd: () => void,
): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      message: "codebreaker.main",
      gameBoard: "codebreaker",
      dashboard: "codebreaker.main",
      on: {
        GUESS_MADE: [
          {
            condition: ["roundCompleted", "gameEnded"],
            type: "END",
          },
          {
            condition: ["roundCompleted", "!gameEnded"],
            type: "END",
          },
          {
            condition: ["codebreakerTurnEnded", "!roundCompleted"],
            type: "scene",
            target: "outcome",
          },
          {
            type: "scene",
            target: "main",
          },
        ],
      },
    },

    outcome: {
      message: "codebreaker.outcome",
      gameBoard: "spectator",
      dashboard: "codebreaker.outcome",
      on: {
        OUTCOME_ACKNOWLEDGED: {
          type: "END",
        },
      },
    },

    waiting: {
      message: "codebreaker.waiting",
      gameBoard: "spectator",
      dashboard: "codebreaker.waiting",
      on: {
        TURN_CHANGED: {
          type: "scene",
          target: "main",
        },
      },
    },
  },
});

/**
 * Codemaster state machine - handles clue giving
 */
export const createCodemasterStateMachine = (
  onEnd: () => void,
): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      message: "codemaster.main",
      gameBoard: "codemaster",
      dashboard: "codemaster.main",
      on: {
        CLUE_GIVEN: {
          type: "END",
        },
      },
    },

    waiting: {
      message: "codemaster.waiting",
      gameBoard: "spectator",
      dashboard: "codemaster.waiting",
      on: {
        TURN_CHANGED: {
          type: "scene",
          target: "main",
        },
      },
    },
  },
});

/**
 * Spectator state machine - simple watching
 */
export const createSpectatorStateMachine = (
  onEnd: () => void,
): StateMachine => ({
  initial: "watching",
  scenes: {
    watching: {
      message: "spectator.watching",
      gameBoard: "spectator",
      dashboard: "spectator.watching",
      on: {},
    },
  },
});

/**
 * None/Lobby state machine - pre-game state
 */
export const createNoneStateMachine = (onEnd: () => void): StateMachine => ({
  initial: "lobby",
  scenes: {
    lobby: {
      message: "none.lobby",
      gameBoard: "spectator",
      dashboard: "none.lobby",
      on: {
        GAME_STARTED: {
          type: "scene",
          target: "dealing",
        },
      },
    },

    dealing: {
      message: "none.dealing",
      gameBoard: "spectator",
      dashboard: "none.dealing",
      on: {
        CARDS_DEALT: {
          type: "scene",
          target: "lobby",
        },
      },
    },

    gameover: {
      message: "none.gameover",
      gameBoard: "spectator",
      dashboard: "none.gameover",
      on: {},
    },
  },
});

/**
 * Factory function to get state machine for role
 */
export const getStateMachine = (
  role: string,
  onEnd: () => void,
): StateMachine => {
  switch (role) {
    case PLAYER_ROLE.CODEBREAKER:
      return createCodebreakerStateMachine(onEnd);
    case PLAYER_ROLE.CODEMASTER:
      return createCodemasterStateMachine(onEnd);
    case PLAYER_ROLE.SPECTATOR:
      return createSpectatorStateMachine(onEnd);
    case PLAYER_ROLE.NONE:
    default:
      return createNoneStateMachine(onEnd);
  }
};
