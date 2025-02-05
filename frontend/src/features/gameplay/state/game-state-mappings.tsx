import React from "react";
import {
  IntroDashboardView,
  TransitionDashboardView,
  CodemasterDashboardView,
  CodebreakerDashboardView,
  GameoverDashboardView,
} from "@frontend/game/ui/dashboard";
import {
  ReadOnlyBoard,
  CodemasterStageBoard,
  CodebreakerStageBoard,
} from "@frontend/game/ui/game-board/game-board-views";
import { GameData } from "@codenames/shared/src/game/game-types";

/**
 * A collection of dynamic messages for each stage and scene in the game.
 * Messages are keyed by stage.scene and generated based on the provided game data.
 */
export const messages: Record<string, (gameData: GameData) => string> = {
  "intro.main": (gameData) =>
    `Welcome to the game! The codemaster for the ${gameData?.settings.startingTeam} team should prepare. They will be responsible for giving clues to help their team find their agents while avoiding the assassin and the opposing agents.`,

  "codemaster.preparation": (gameData) =>
    `Codemaster of the ${
      gameData.state.rounds.at(-1)?.team
    } team, your turn is starting. Get ready to give your clue...`,

  "codemaster.main": (gameData) =>
    `Codemaster of the ${
      gameData.state.rounds.at(-1)?.team
    }, enter your codeword and the number of associated guesses. Remember, your clue must help your team find their agents without revealing the assassin or opposing agents.`,

  "codebreaker.preparation": (gameData) =>
    `Codebreakers of the ${
      gameData.state.rounds.at(-1)?.team
    }, get ready for your turn. You'll soon be guessing words based on your codemaster's clue.`,

  "codebreaker.main": (gameData) =>
    `Codebreakers of the ${
      gameData.state.rounds.at(-1)?.team
    }, pick your cards based on the clue given by your codemaster! Try to find all of your agents without picking a bystander, opposing agent, or the assassin.`,

  "codebreaker.outcome": () =>
    `Turn outcome: Review the results of the last move.`,

  "gameover.main": (gameData) =>
    `Game over! The ${gameData.state.winner} team has won! Congratulations to the winning team on finding all of your agents while avoiding the assassin.`,
};

/**
 * A mapping of game board keys to their corresponding React components.
 * Each component renders the appropriate game board view based on the current scene.
 */
export const gameBoards: Record<string, React.FC<{ gameData: GameData }>> = {
  readOnlyBoard: ReadOnlyBoard,
  codemasterBoard: CodemasterStageBoard,
  codebreakerBoard: CodebreakerStageBoard,
};

/**
 * A mapping of dashboard keys to their corresponding React components.
 * Each component renders the appropriate dashboard view for the current stage and scene.
 */
export const dashboards: Record<string, React.FC> = {
  introDashboard: IntroDashboardView,
  transitionDashboard: TransitionDashboardView,
  codemasterDashboard: CodemasterDashboardView,
  codebreakerDashboard: CodebreakerDashboardView,
  gameoverDashboard: GameoverDashboardView,
};
