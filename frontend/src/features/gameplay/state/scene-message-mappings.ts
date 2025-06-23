import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";

const getOutcomeMessage = (outcome: string): string => {
  switch (outcome) {
    case "CORRECT_TEAM":
      return "✅ Correct!";
    case "WRONG_TEAM":
      return "❌ Wrong team";
    case "NEUTRAL":
      return "⚪ Neutral card";
    case "ASSASSIN":
      return "💀 Game over!";
    default:
      return outcome;
  }
};

/**
 * Dynamic message generation based on role, scene, and game state
 */
export const getSceneMessage = (
  role: string,
  scene: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): string => {
  const messageKey = `${role}.${scene}`;

  switch (messageKey) {
    case "codebreaker.main":
      if (!activeTurn?.clue) {
        return "Waiting for clue from your Codemaster...";
      }

      const { clue } = activeTurn;
      const remaining = activeTurn.guessesRemaining || 0;
      const guessText = remaining === 1 ? "guess" : "guesses";

      if (activeTurn.hasGuesses && activeTurn.lastGuess && remaining > 0) {
        const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
        return `${outcomeMessage} • "${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;
      }

      return `"${clue.word}" for ${clue.number} • ${remaining} ${guessText} left`;

    case "codebreaker.outcome":
      if (activeTurn?.lastGuess) {
        const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
        return `${outcomeMessage} • Your turn is over`;
      }
      return "Turn ended";

    case "codebreaker.waiting":
      return "Waiting for the other team...";

    case "codemaster.main":
      return "Give a clue to your team";

    case "codemaster.waiting":
      return "Waiting for your team to guess...";

    case "spectator.watching":
      if (activeTurn?.clue) {
        return `Watching: "${activeTurn.clue.word}" for ${activeTurn.clue.number}`;
      }
      return "Watching the game...";

    case "none.lobby":
      return "Waiting for game to start...";

    case "none.dealing":
      return "Dealing cards...";

    case "none.gameover":
      return "🎉 Game Over!";

    default:
      return "Ready to play";
  }
};
