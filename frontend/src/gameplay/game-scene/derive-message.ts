import type { VisibilityContext } from "../game-controls/dashboards/config/context";
import type { TurnData } from "@frontend/shared-types";

/**
 * Derives the current status message purely from server state.
 * Replaces scene-messages.ts which was keyed on role.scene strings.
 */

const getOutcomeMessage = (outcome: string, teamName: string): string => {
  switch (outcome) {
    case "CORRECT_TEAM_CARD":
      return "Good guess!";
    case "OTHER_TEAM_CARD": {
      const otherTeam = teamName.includes("Red") ? "blue" : "red";
      return `Unlucky, that's a ${otherTeam} card! ${teamName}'s turn is over`;
    }
    case "BYSTANDER_CARD":
      return `Unlucky, that's a bystander card! ${teamName}'s turn is over`;
    case "ASSASSIN_CARD":
      return "Oh no! That's the assassin! Game over";
    default:
      return `${teamName}'s turn is over`;
  }
};

const getGuessesText = (remaining: number): string => {
  if (remaining === 1) return "You have 1 guess remaining";
  return `You have ${remaining} guesses remaining`;
};

export const deriveMessage = (
  ctx: VisibilityContext,
  lastCompletedTurn: TurnData | null,
  activeTurn: TurnData | null,
): string => {
  // --- Round-level states ---
  if (ctx.roundStatus === "COMPLETED") {
    return "Game over!";
  }

  if (ctx.roundStatus === "SETUP" && !ctx.hasCards) {
    return "Welcome! Ready to start the game?";
  }

  if (ctx.roundStatus === "SETUP" && ctx.hasCards) {
    return "Cards dealt... Get ready!";
  }

  // --- Between turns (no active turn) ---
  if (!ctx.hasActiveTurn) {
    if (lastCompletedTurn?.lastGuess) {
      return getOutcomeMessage(
        lastCompletedTurn.lastGuess.outcome ?? "",
        lastCompletedTurn.teamName,
      );
    }
    return "Waiting for next turn...";
  }

  // --- Active turn: Codemaster ---
  if (ctx.role === "CODEMASTER" && ctx.isActiveTeam && !ctx.hasClue) {
    const teamName = activeTurn?.teamName ?? "Your team";
    return `${teamName} Codemaster, give your team a clue`;
  }

  if (ctx.role === "CODEMASTER" && ctx.hasClue) {
    const remaining = ctx.guessesRemaining;
    if (remaining === 0) return "Your team's turn is complete";
    return `Your team is guessing... ${remaining} guess${remaining === 1 ? "" : "es"} left`;
  }

  if (ctx.role === "CODEMASTER") {
    return "Waiting for the other team...";
  }

  // --- Active turn: Codebreaker ---
  if (ctx.role === "CODEBREAKER" && ctx.isActiveTeam && !ctx.hasClue) {
    return "Waiting for your codemaster to give a clue...";
  }

  if (ctx.role === "CODEBREAKER" && ctx.isActiveTeam && ctx.hasClue) {
    const teamName = activeTurn?.teamName ?? "Your team";
    return `${teamName}, time to make a guess! ${getGuessesText(ctx.guessesRemaining)}`;
  }

  if (ctx.role === "CODEBREAKER") {
    return "Waiting for the other team...";
  }

  // --- Spectator / None ---
  if (activeTurn?.clue) {
    const remaining = ctx.guessesRemaining;
    return `${activeTurn.teamName} is guessing "${activeTurn.clue.word}" for ${activeTurn.clue.number} • ${remaining} guess${remaining === 1 ? "" : "es"} left`;
  }

  if (ctx.hasActiveTurn) {
    return "Codemaster is thinking...";
  }

  return "Watching the game";
};
