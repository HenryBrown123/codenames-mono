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
 * None/Lobby state machine - pre-game state with proper transitions
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
        CARDS_DEALT: {
          type: "END", // Cards dealt means we're ready to transition to player role
        },
        ROUND_STARTED: {
          type: "END", // Round started means game is active, transition to player role
        },
      },
    },

    dealing: {
      on: {
        CARDS_DEALT: {
          type: "scene",
          target: "lobby",
        },
        ROUND_STARTED: {
          type: "END", // If round starts during dealing, transition to player role
        },
      },
    },

    gameover: {
      on: {
        GAME_STARTED: {
          type: "scene",
          target: "dealing",
        },
      },
    },
  },
});

/**
 * Codebreaker state machine - handles guessing flow
 */
export const createCodebreakerStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        GUESS_MADE: [
          // Check if round/game ended first
          {
            condition: ["roundCompleted"],
            type: "END",
          },
          {
            condition: ["gameEnded"],
            type: "END",
          },
          {
            condition: ["codebreakerTurnEnded"],
            type: "scene",
            target: "outcome",
          },
          {
            type: "scene",
            target: "main",
          },
        ],
        TURN_ENDED: {
          type: "END", // Manual turn end by codebreakers
        },
      },
    },

    outcome: {
      on: {
        OUTCOME_ACKNOWLEDGED: {
          type: "END", // Move to next role (usually codemaster of other team)
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
          type: "END", // Clue given, transition to codebreaker role
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
      on: {
        TURN_CHANGED: {
          type: "scene",
          target: "watching", // Stay watching
        },
      },
    },
  },
});

/**
 * Factory function to get state machine for role
 */
export const getStateMachine = (role: string): StateMachine => {
  console.log(`[STATE_MACHINE] Getting state machine for role: ${role}`);

  switch (role.toUpperCase()) {
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
