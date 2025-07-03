// frontend/src/gameplay/role-scenes/scene-config.ts
import { PLAYER_ROLE } from "@codenames/shared/types";

interface StateTransition {
  type: "scene" | "END";
  target?: string;
}

interface SceneConfig {
  on?: Record<string, StateTransition>;
}

interface StateMachine {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

/**
 * None/Lobby state machine - pre-game state
 */
export const createNoneStateMachine = (): StateMachine => ({
  initial: "lobby",
  scenes: {
    lobby: {
      on: {
        ROUND_CREATED: {
          type: "scene",
          target: "dealing",
        },
        CARDS_DEALT: {
          type: "END",
        },
        ROUND_STARTED: {
          type: "END",
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
          type: "END",
        },
      },
    },

    gameover: {
      on: {
        ROUND_CREATED: {
          type: "scene",
          target: "dealing",
        },
      },
    },
  },
});

/**
 * Codebreaker state machine - outcome driven
 */
export const createCodebreakerStateMachine = (): StateMachine => ({
  initial: "main",
  scenes: {
    main: {
      on: {
        CORRECT_GUESS: {
          type: "scene",
          target: "main", // Stay in main for another guess
        },
        WRONG_GUESS: {
          type: "scene",
          target: "outcome", // Show outcome
        },
        TURN_COMPLETED: {
          type: "scene",
          target: "outcome", // Turn over, show outcome
        },
        TURN_ENDED: {
          type: "END", // Manual end turn
        },
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
 * Codemaster state machine
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
 * Spectator state machine
 */
export const createSpectatorStateMachine = (): StateMachine => ({
  initial: "watching",
  scenes: {
    watching: {
      on: {
        TURN_CHANGED: {
          type: "scene",
          target: "watching",
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
