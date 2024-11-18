import React from "react";
import {
  IntroDashboardView,
  TransitionDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  GameoverDashboardView,
} from "@game/components/dashboard";
import {
  CodemasterStageBoard,
  CodebreakerStageBoard,
  ReadOnlyBoard,
} from "@game/components/game-board/game-board-views";

import { STAGE } from "@game/game-common-constants";
import { GameData, Stage } from "@game/game-common-types";

type UIConfig = {
  [stage in Stage]: {
    sceneOrder: string[];
    scenes: {
      [sceneName: string]: {
        message: (gameData: GameData) => string | null;
        gameBoard: (gameData: GameData) => React.ReactNode;
        dashboard: () => React.ReactNode;
      };
    };
  };
};

export const uiConfig: UIConfig = {
  [STAGE.INTRO]: {
    sceneOrder: ["main"],
    scenes: {
      main: {
        message: (gameData) =>
          `Welcome to the game! The codemaster for the ${gameData?.settings.startingTeam} team should prepare. They will be responsible for giving clues to help their team find their agents while avoiding the assassin and the opposing agents.`,
        gameBoard: (gameData) => <ReadOnlyBoard gameData={gameData} />,
        dashboard: () => <IntroDashboardView />,
      },
    },
  },
  [STAGE.CODEMASTER]: {
    sceneOrder: ["preparation", "main"],
    scenes: {
      preparation: {
        message: (gameData) =>
          `Codemaster of the ${
            gameData.state.rounds.at(-1).team
          } team, your turn is starting. Get ready to give your clue...`,
        gameBoard: (gameData) => <ReadOnlyBoard gameData={gameData} />,
        dashboard: () => <TransitionDashboardView />,
      },
      main: {
        message: (gameData) =>
          `Codemaster of the ${
            gameData.state.rounds.at(-1).team
          } team, enter your codeword and the number of associated guesses. Remember, your clue must help your team find their agents without revealing the assassin or opposing agents.`,
        gameBoard: (gameData) => <CodemasterStageBoard gameData={gameData} />,
        dashboard: () => <CodemasterDashboardView />,
      },
    },
  },
  [STAGE.CODEBREAKER]: {
    sceneOrder: ["preparation", "main"],
    scenes: {
      preparation: {
        message: (gameData) =>
          `Codebreakers of the ${
            gameData.state.rounds.at(-1).team
          } team, get ready for your turn. You'll soon be guessing words based on your codemaster's clue.`,
        gameBoard: (gameData) => <ReadOnlyBoard gameData={gameData} />,
        dashboard: () => <TransitionDashboardView />,
      },
      main: {
        message: (gameData) =>
          `Codebreakers of the ${
            gameData.state.rounds.at(-1).team
          } team, pick your cards based on the clue given by your codemaster! Try to find all of your agents without picking a bystander, opposing agent, or the assassin.`,
        gameBoard: (gameData) => <CodebreakerStageBoard gameData={gameData} />,
        dashboard: () => <CodebreakerDashboardView />,
      },
    },
  },
  [STAGE.GAMEOVER]: {
    sceneOrder: ["main"],
    scenes: {
      main: {
        message: (gameData) =>
          `Game over! The ${gameData.state.winner} team has won! Congratulations to the winning team on finding all of your agents while avoiding the assassin.`,
        gameBoard: (gameData) => <ReadOnlyBoard gameData={gameData} />,
        dashboard: () => <GameoverDashboardView />,
      },
    },
  },
};
