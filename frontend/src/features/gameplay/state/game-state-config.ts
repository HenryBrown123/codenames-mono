import { STAGE } from "@codenames/shared/src/game/game-constants";
import { Stage } from "@codenames/shared/src/game/game-types";

/**
 * The central UI configuration for the game.
 * Defines all stages, their scenes, and the transitions between them.
 */
export const uiConfig: UIConfig = {
  [STAGE.INTRO]: {
    initial: "main",
    scenes: {
      main: {
        message: "intro.main",
        gameBoard: "readOnlyBoard",
        dashboard: "introDashboard",
      },
    },
  },
  [STAGE.CODEMASTER]: {
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
      },
    },
  },
  [STAGE.CODEBREAKER]: {
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
          TURN_PROCESSED: { type: "scene", target: "outcome" },
        },
      },
      outcome: {
        message: "codebreaker.outcome",
        gameBoard: "codebreakerBoard",
        dashboard: "transitionDashboard",
        on: {
          next: { type: "scene", target: "main" },
        },
      },
    },
  },
  [STAGE.GAMEOVER]: {
    initial: "main",
    scenes: {
      main: {
        message: "gameover.main",
        gameBoard: "readOnlyBoard",
        dashboard: "gameoverDashboard",
        on: {
          // "restart" is a user-triggered event, not a turn processed event
          restart: { type: "stage", target: STAGE.INTRO },
        },
      },
    },
  },
};

/**
 * Represents the configuration of a single scene within a stage.
 * Each scene defines its associated UI components and the transitions available from that scene.
 */
interface SceneConfig {
  message: string;
  gameBoard: string;
  dashboard: string;
  on?: Record<string, { type: "scene" | "stage"; target: string | Stage }>;
}

interface StageConfig {
  initial: string;
  scenes: Record<string, SceneConfig>;
}

type UIConfig = Record<Stage, StageConfig>;
