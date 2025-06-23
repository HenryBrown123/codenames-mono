import { GameData } from "@frontend/shared-types";
import { TurnData } from "../api/queries/use-turn-query";

/**
 * Helper to get outcome message
 */
const getOutcomeMessage = (outcome: string): string => {
  switch (outcome) {
    case "CORRECT_TEAM":
      return "✅ Good guess!";
    case "WRONG_TEAM":
      return "❌ Oops! That's the other team's card";
    case "NEUTRAL":
      return "⚪ Neutral card - turn over";
    case "ASSASSIN":
      return "💀 Assassin! Game over";
    default:
      return "Turn ended";
  }
};

/**
 * Helper to get team-specific greeting
 */
const getTeamGreeting = (teamName: string, role: string): string => {
  return `${teamName} ${role}`;
};

/**
 * Helper to get clue context for codebreakers
 */
const getClueContext = (activeTurn: TurnData | null): string => {
  if (!activeTurn?.clue) {
    return "Waiting for your Codemaster to give a clue...";
  }

  const { clue } = activeTurn;
  const remaining = activeTurn.guessesRemaining || 0;
  const guessText = remaining === 1 ? "guess" : "guesses";

  // Show outcome feedback for recent guess
  if (activeTurn.hasGuesses && activeTurn.lastGuess && remaining > 0) {
    const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
    return `${outcomeMessage} • "${clue.word}" for ${clue.number} • ${remaining} ${guessText} remaining`;
  }

  return `Clue: "${clue.word}" for ${clue.number} • ${remaining} ${guessText} remaining`;
};

/**
 * Dynamic message generation for an input role/scene.
 */
export const getSceneMessage = (
  role: string,
  scene: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): string => {
  const normalizedRole = role.toLowerCase();
  const messageKey = `${normalizedRole}.${scene}`;
  const playerTeam = gameData.playerContext?.teamName || "Team";

  switch (messageKey) {
    case "codebreaker.main":
      return `${getTeamGreeting(playerTeam, "Codebreaker")} • ${getClueContext(activeTurn)}`;

    case "codebreaker.outcome":
      if (activeTurn?.lastGuess) {
        const outcomeMessage = getOutcomeMessage(activeTurn.lastGuess.outcome);
        return `${getTeamGreeting(playerTeam, "Codebreaker")} • ${outcomeMessage}`;
      }
      return `${getTeamGreeting(playerTeam, "Codebreaker")} • Turn ended`;

    case "codebreaker.waiting":
      return `${getTeamGreeting(playerTeam, "Codebreaker")} • Waiting for other team...`;

    case "codemaster.main":
      return `${getTeamGreeting(playerTeam, "Codemaster")} • Give your team a clue`;

    case "codemaster.waiting":
      if (activeTurn?.clue) {
        const remaining = activeTurn.guessesRemaining || 0;
        const guessText = remaining === 1 ? "guess" : "guesses";
        return `${getTeamGreeting(playerTeam, "Codemaster")} • "${activeTurn.clue.word}" for ${activeTurn.clue.number} • ${remaining} ${guessText} remaining`;
      }
      return `${getTeamGreeting(playerTeam, "Codemaster")} • Waiting for your team...`;

    case "spectator.watching":
      const currentActiveTurn = gameData.currentRound?.turns?.find(
        (t) => t.status === "ACTIVE",
      );
      if (currentActiveTurn?.clue) {
        return `Watching • ${currentActiveTurn.teamName}: "${currentActiveTurn.clue.word}" for ${currentActiveTurn.clue.number}`;
      }
      return `Watching • ${currentActiveTurn?.teamName || "Game"} team's turn`;

    case "none.lobby":
      return "Welcome! Ready to start the game?";

    case "none.dealing":
      return "Dealing cards... Get ready!";

    case "none.gameover":
      // Check for winner in game data
      const winner = gameData.teams?.find((team) => team.score >= 9);
      if (winner) {
        return `🎉 ${winner.name} wins!`;
      }
      return "🎉 Game Over!";

    default:
      console.warn(`No message found for ${messageKey}, using default`);
      return "Ready to play";
  }
};
