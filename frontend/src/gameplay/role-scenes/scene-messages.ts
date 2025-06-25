import { GameData, TurnData } from "@frontend/shared-types";

/**
 * Helper to get outcome message for codebreakers
 */
const getOutcomeMessage = (outcome: string, teamName: string): string => {
  switch (outcome) {
    case "CORRECT_TEAM_CARD":
      return "Good guess!";
    case "OTHER_TEAM_CARD":
      const otherTeam = teamName.includes("Red") ? "blue" : "red";
      return `Unlucky, that's a ${otherTeam} card! ${teamName}'s turn is over`;
    case "BYSTANDER_CARD":
      return `Unlucky, that's a bystander card! ${teamName}'s turn is over`;
    case "ASSASSIN_CARD":
      return "Oh no! That's the assassin! Game over";
    default:
      return `${teamName}'s turn is over`;
  }
};

/**
 * Helper to format guesses remaining text
 */
const getGuessesText = (remaining: number): string => {
  if (remaining === 1) {
    return "You have 1 guess remaining";
  }
  return `You have ${remaining} guesses remaining`;
};

/**
 * Helper to check if turn was perfect (found all clued cards)
 */
const wasPerfectTurn = (activeTurn: TurnData | null): boolean => {
  if (!activeTurn?.clue || !activeTurn.hasGuesses || !activeTurn.lastGuess) {
    return false;
  }
  const correctGuesses = [
    activeTurn.lastGuess,
    ...activeTurn.prevGuesses,
  ].filter((guess) => guess.outcome === "CORRECT_TEAM_CARD").length;

  return correctGuesses === activeTurn.clue.number;
};

/**
 * Helper to check if target was reached (found all clued cards, bonus available)
 */
const wasTargetReached = (activeTurn: TurnData | null): boolean => {
  if (
    !activeTurn?.clue ||
    !activeTurn.hasGuesses ||
    !activeTurn.lastGuess ||
    activeTurn.guessesRemaining === 0
  ) {
    return false;
  }

  const correctGuesses = [
    activeTurn.lastGuess,
    ...activeTurn.prevGuesses,
  ].filter((guess) => guess.outcome === "CORRECT_TEAM_CARD").length;

  return (
    correctGuesses === activeTurn.clue.number && activeTurn.guessesRemaining > 0
  );
};

/**
 * Dynamic message generation for each role/scene combination
 */
export const getSceneMessage = (
  role: string,
  scene: string,
  gameData: GameData,
  activeTurn: TurnData | null,
): string => {
  const normalizedRole = role.toLowerCase();
  const messageKey = `${normalizedRole}.${scene}`;
  const teamName = activeTurn?.teamName || "Your team";

  switch (messageKey) {
    case "codebreaker.main":
      if (!activeTurn?.clue) {
        return "Waiting for your codemaster to give a clue...";
      }

      const remaining = activeTurn.guessesRemaining || 0;

      // First guess of the turn
      if (!activeTurn.hasGuesses) {
        return `${teamName}, time to make a guess! ${getGuessesText(remaining)}`;
      }

      // After a correct guess - check if target reached
      if (activeTurn.lastGuess?.outcome === "CORRECT_TEAM_CARD") {
        if (wasTargetReached(activeTurn)) {
          return `Excellent! You found all ${activeTurn.clue.number} cards. Bonus guess available`;
        }
        return `Good guess! ${getGuessesText(remaining)}`;
      }

      // This shouldn't happen in main state after wrong guess, but safety fallback
      return `${teamName}, time to make a guess! ${getGuessesText(remaining)}`;

    case "codebreaker.outcome":
      if (!activeTurn?.lastGuess) {
        return `${teamName}'s turn is over`;
      }

      // Check if it was a perfect turn (found exactly the clued number)
      if (
        activeTurn.lastGuess.outcome === "CORRECT_TEAM_CARD" &&
        wasPerfectTurn(activeTurn)
      ) {
        return "Well done, perfect turn! Over to the next team";
      }

      // Regular outcome message
      return getOutcomeMessage(activeTurn.lastGuess.outcome, teamName);

    case "codebreaker.waiting":
      return "Waiting for the other team...";

    case "codemaster.main":
      return `${teamName} Codemaster, give your team a clue`;

    case "codemaster.waiting":
      if (activeTurn?.clue) {
        const remaining = activeTurn.guessesRemaining || 0;
        if (remaining === 0) {
          return "Your team's turn is complete";
        }
        return `Your team is guessing... ${remaining} guess${remaining === 1 ? "" : "es"} left`;
      }
      return "Waiting for your team...";

    case "spectator.watching":
      const currentActiveTurn = gameData.currentRound?.turns?.find(
        (t) => t.status === "ACTIVE",
      );

      if (currentActiveTurn?.clue) {
        const remaining = currentActiveTurn.guessesRemaining || 0;
        return `${currentActiveTurn.teamName} is guessing "${currentActiveTurn.clue.word}" for ${currentActiveTurn.clue.number} • ${remaining} guess${remaining === 1 ? "" : "es"} left`;
      }

      if (currentActiveTurn) {
        return `${currentActiveTurn.teamName} Codemaster is thinking...`;
      }

      return "Watching the game";

    case "none.lobby":
      return "Welcome! Ready to start the game?";

    case "none.dealing":
      return "Cards dealt... Get ready!";

    case "none.gameover":
      // Check for winner in game data
      const winner = gameData.teams?.find((team) => team.score >= 9);
      if (winner) {
        return `Game over! ${winner.name} wins!`;
      }
      return "Game over!";

    default:
      console.warn(`No message found for ${messageKey}, using default`);
      return "Ready to play";
  }
};
