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
 * Handles both uppercase and lowercase role names for consistency
 */
export const getSceneMessage = (
  role: string,
  scene: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): string => {
  // Normalize to lowercase for consistent mapping
  const normalizedRole = role.toLowerCase();
  const messageKey = `${normalizedRole}.${scene}`;

  console.log(
    `[SCENE_MESSAGES] Getting message for: ${messageKey} (original: ${role}.${scene})`,
  );

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
      console.warn(
        `[SCENE_MESSAGES] No message found for ${messageKey}, using default`,
      );
      return "Ready to play";
  }
};
