import { PLAYER_ROLE } from "@codenames/shared/types";

interface StateTransition {
  condition?: string | string[];
  type: "scene" | "END";
  target?: string;
}

interface SceneConfig {
  on?: Record<string, StateTransition | StateTransition[]>;
}

interface StateMachine {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

/**
 * Codebreaker state machine - handles guessing flow
 */
export const createCodebreakerStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
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
      on: {
        OUTCOME_ACKNOWLEDGED: {
          type: "END",
        },
      },
    },

    waiting: {
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
export const createCodemasterStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        CLUE_GIVEN: {
          type: "END",
        },
      },
    },

    waiting: {
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
export const createSpectatorStateMachine = (): StateMachine => ({
  initial: "watching",
  scenes: {
    watching: {
      on: {},
    },
  },
});

/**
 * None/Lobby state machine - pre-game state
 */
export const createNoneStateMachine = (): StateMachine => ({
  initial: "lobby",
  scenes: {
    lobby: {
      on: {
        GAME_STARTED: {
          type: "scene",
          target: "dealing",
        },
      },
    },

    dealing: {
      on: {
        CARDS_DEALT: {
          type: "scene",
          target: "lobby",
        },
      },
    },

    gameover: {
      on: {},
    },
  },
});

/**
 * Factory function to get state machine for role
 */
export const getStateMachine = (role: string): StateMachine => {
  switch (role) {
    case PLAYER_ROLE.CODEBREAKER:
      return createCodebreakerStateMachine();
    case PLAYER_ROLE.CODEMASTER:
      return createCodemasterStateMachine();
    case PLAYER_ROLE.SPECTATOR:
      return createSpectatorStateMachine();
    case PLAYER_ROLE.NONE:
    default:
      return createNoneStateMachine();
  }
};
