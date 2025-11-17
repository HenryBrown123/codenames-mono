/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { LocalLLMService } from "../llm/local-llm.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TurnFinder } from "@backend/common/data-access/repositories/turns.repository";
import type { PlayerFinderAll } from "@backend/common/data-access/repositories/players.repository";
import { gameEventBus } from "../events/game-event-bus";
import { WebSocketEvent } from "@backend/common/websocket/websocket-events.types";
import type { GameplayEventPayload } from "@backend/common/websocket/websocket-events.types";
import {
  buildCodemasterPrompt,
  buildCodebreakerPrompt,
} from "../strategy/ai-prompts";

export type AIPlayerDependencies = {
  llm: LocalLLMService;
  giveClue: GiveClueService;
  makeGuess: MakeGuessService;
  getGameState: GameplayStateProvider;
};

type AIDecisionContext = {
  gameId: string;
  playerId: string;
  userId: number;
  role: "CODEMASTER" | "CODEBREAKER";
  roundNumber: number;
};

/**
 * Tracking active AI decision processes to prevent duplicate actions
 */
const activeDecisions = new Set<string>();

/**
 * Random delay between min and max (in milliseconds)
 */
const randomDelay = (min: number, max: number): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Creates the AI player service
 */
export const createAIPlayerService = (dependencies: AIPlayerDependencies) => {
  const { llm, giveClue, makeGuess, getGameState } = dependencies;

  /**
   * Check current game state and determine if AI should act
   * This is the main logic - called after ANY game event
   *
   * Simple: Get game state -> Get current round -> Get active turn -> Check if AI needs to act
   */
  const checkAndActIfNeeded = async (gameId: string) => {
    try {
      // Get game state using userId=0 for server-side AI (bypasses player validation)
      const gameState = await getGameState(gameId, 0, null);

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        return;
      }

      const currentRound = gameState.data.currentRound;
      const turns = currentRound.turns;
      if (!turns || turns.length === 0) {
        return;
      }

      // Get the current/latest turn
      const currentTurn = turns[turns.length - 1];
      if (!currentTurn) {
        return;
      }

      // Get all players from game state (includes isAi field)
      const allPlayers = gameState.data.teams.flatMap(team => team.players);

      // Check if current turn needs a clue (no clue yet)
      if (!currentTurn.clue) {
        // Find if this team's codemaster is AI
        const teamName = currentTurn.teamName;

        const aiCodemaster = allPlayers.find(
          (p) => p.teamName === teamName && p.isAi && p.role === "CODEMASTER"
        );

        if (aiCodemaster) {
          console.log(`[AI] No clue for ${teamName}, AI codemaster should act`);

          const context: AIDecisionContext = {
            gameId,
            playerId: aiCodemaster.publicId,
            userId: aiCodemaster._userId,
            role: "CODEMASTER",
            roundNumber: currentRound.number,
          };

          await aiGiveClue(context);
          return; // Done
        }
      }

      // Check if current turn has a clue and needs guesses
      if (currentTurn.clue && currentTurn.guessesRemaining > 0) {
        // Check if this team has AI codebreakers
        const teamName = currentTurn.teamName;

        // Check if ALL codebreakers on this team are AI
        const teamCodebreakers = allPlayers.filter(
          (p) => p.teamName === teamName && p.role === "CODEBREAKER"
        );

        const allCodebreakersAreAI = teamCodebreakers.length > 0 &&
          teamCodebreakers.every((p) => p.isAi);

        if (allCodebreakersAreAI) {
          // Pick any AI codebreaker
          const aiCodebreaker = teamCodebreakers[0];

          console.log(`[AI] ${teamName} needs guess, all codebreakers are AI`);

          const context: AIDecisionContext = {
            gameId,
            playerId: aiCodebreaker.publicId,
            userId: aiCodebreaker._userId,
            role: "CODEBREAKER",
            roundNumber: currentRound.number,
          };

          await aiMakeGuess(context);
          return; // Done
        }
      }

      // No AI action needed
    } catch (error) {
      console.error("[AI] Error in checkAndActIfNeeded:", error);
    }
  };

  /**
   * AI gives a clue as CODEMASTER
   */
  const aiGiveClue = async (context: AIDecisionContext): Promise<void> => {
    const decisionKey = `clue:${context.gameId}:${context.playerId}`;

    if (activeDecisions.has(decisionKey)) {
      console.log(`[AI] Already processing clue for ${context.playerId}`);
      return;
    }

    activeDecisions.add(decisionKey);

    try {
      // Add realistic delay (1-3 seconds)
      await randomDelay(1000, 3000);

      // Get game state to see all cards
      const gameState = await getGameState(
        context.gameId,
        context.userId,
        context.playerId,
      );

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        console.error(`[AI] Failed to get game state for ${context.playerId}`);
        return;
      }

      const cards = gameState.data.currentRound.cards;
      const myTeam = gameState.data.playerContext?.teamName;

      if (!myTeam) {
        console.error(`[AI] No team found for ${context.playerId}`);
        return;
      }

      // Categorize cards
      const myTeamCards = cards
        .filter((c: any) => c.teamName === myTeam && !c.selected)
        .map((c: any) => c.word);
      const opponentCards = cards
        .filter((c: any) => c.teamName && c.teamName !== myTeam && !c.selected)
        .map((c: any) => c.word);
      const assassinCard =
        cards.find((c: any) => c.cardType === "ASSASSIN" && !c.selected)?.word ||
        "UNKNOWN";
      const bystanderCards = cards
        .filter((c: any) => c.cardType === "BYSTANDER" && !c.selected)
        .map((c: any) => c.word);

      if (myTeamCards.length === 0) {
        console.log(`[AI] No cards left for ${context.playerId}`);
        return;
      }

      // Build prompt
      const prompt = buildCodemasterPrompt({
        myTeamCards,
        opponentCards,
        assassinCard,
        bystanderCards,
        difficulty: "medium",
      });

      // Get AI decision
      const decision = await llm.generateJSON<{
        targets?: string[];
        word: string;
        count: number;
        reasoning?: string;
      }>(prompt);

      console.log(
        `[AI] ${context.playerId} giving clue: ${decision.word} for ${decision.count}`,
      );
      if (decision.targets && decision.targets.length > 0) {
        console.log(`[AI] Targeting cards: ${decision.targets.join(", ")}`);
      }
      if (decision.reasoning) {
        console.log(`[AI] Reasoning: ${decision.reasoning}`);
      }

      // Validate clue word is not on the board
      const allBoardWords = [...myTeamCards, ...opponentCards, assassinCard, ...bystanderCards];
      const clueWordLower = decision.word.toLowerCase();
      if (allBoardWords.some(w => w.toLowerCase() === clueWordLower)) {
        console.error(`[AI] ERROR: Clue word "${decision.word}" is on the board! Board words: ${allBoardWords.join(", ")}`);
        console.error(`[AI] The AI failed validation - this should not happen with improved prompts`);
        return;
      }

      // Give the clue
      const result = await giveClue({
        gameId: context.gameId,
        roundNumber: context.roundNumber,
        userId: context.userId,
        playerId: context.playerId,
        word: decision.word,
        targetCardCount: decision.count,
      });

      if (!result.success) {
        console.error(
          `[AI] Failed to give clue:`,
          result.error,
        );
      }
    } catch (error) {
      console.error(`[AI] Error giving clue:`, error);
    } finally {
      activeDecisions.delete(decisionKey);
    }
  };

  /**
   * AI makes a guess as CODEBREAKER
   */
  const aiMakeGuess = async (context: AIDecisionContext): Promise<void> => {
    const decisionKey = `guess:${context.gameId}:${context.playerId}`;

    if (activeDecisions.has(decisionKey)) {
      console.log(`[AI] Already processing guess for ${context.playerId}`);
      return;
    }

    activeDecisions.add(decisionKey);

    try {
      // Add realistic delay (2-4 seconds for thinking)
      await randomDelay(2000, 4000);

      // Get game state
      const gameState = await getGameState(
        context.gameId,
        context.userId,
        context.playerId,
      );

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        console.error(`[AI] Failed to get game state for ${context.playerId}`);
        return;
      }

      const currentTurn = gameState.data.currentRound.turns.at(-1);
      if (!currentTurn || !currentTurn.clue) {
        console.error(`[AI] No clue found for ${context.playerId}`);
        return;
      }

      const availableCards = gameState.data.currentRound.cards
        .filter((c: any) => !c.selected)
        .map((c: any) => c.word);

      if (availableCards.length === 0) {
        console.log(`[AI] No cards available for ${context.playerId}`);
        return;
      }

      // Build prompt
      const prompt = buildCodebreakerPrompt({
        clueWord: currentTurn.clue.word,
        clueCount: currentTurn.clue.number,
        availableCards,
        difficulty: "medium",
      });

      // Try up to 3 times to get a valid guess
      const maxAttempts = 3;
      let attempt = 0;
      let validGuess = false;

      while (attempt < maxAttempts && !validGuess) {
        attempt++;

        // Get AI decision
        const decision = await llm.generateJSON<{ card: string; reasoning?: string }>(prompt);

        console.log(`[AI] ${context.playerId} guessing (attempt ${attempt}): ${decision.card}`);
        if (decision.reasoning) {
          console.log(`[AI] Reasoning: ${decision.reasoning}`);
        }

        // Validate the guess before making it
        if (!decision.card || typeof decision.card !== 'string') {
          console.warn(`[AI] Invalid decision format, retrying...`);
          continue;
        }

        // Check if the card is actually in available cards
        if (!availableCards.includes(decision.card)) {
          console.warn(`[AI] Card "${decision.card}" not in available cards. Available: ${availableCards.join(", ")}`);

          // If it's the clue word, that's a specific error
          if (decision.card.toLowerCase() === currentTurn.clue.word.toLowerCase()) {
            console.warn(`[AI] ERROR: Tried to guess the clue word "${currentTurn.clue.word}"!`);
          }

          // Try again with more explicit prompt
          if (attempt < maxAttempts) {
            console.log(`[AI] Retrying with clearer prompt...`);
            await randomDelay(500, 1000);
          }
          continue;
        }

        // Make the guess
        const result = await makeGuess({
          gameId: context.gameId,
          roundNumber: context.roundNumber,
          userId: context.userId,
          playerId: context.playerId,
          cardWord: decision.card,
        });

        if (!result.success) {
          console.error(`[AI] Failed to make guess:`, result.error);

          // If validation failed, retry
          if (attempt < maxAttempts) {
            console.log(`[AI] Guess rejected by service, retrying...`);
            await randomDelay(500, 1000);
            continue;
          }
        } else {
          console.log(`[AI] Guess result: ${result.data.guess.outcome}`);
          validGuess = true;
        }
      }

      if (!validGuess) {
        console.error(`[AI] Failed to make valid guess after ${maxAttempts} attempts`);
      }
    } catch (error) {
      console.error(`[AI] Error making guess:`, error);
    } finally {
      activeDecisions.delete(decisionKey);
    }
  };

  /**
   * Generic handler for ALL game events
   * Just checks state and acts if needed - no special logic per event type
   */
  const handleGameEvent = async (eventName: string, payload: any) => {
    console.log(`[AI] ${eventName} event received for game ${payload.gameId}`);

    // Small delay to ensure database is updated
    await randomDelay(500, 1000);

    // Simple: just check game state and act if needed
    await checkAndActIfNeeded(payload.gameId);
  };

  /**
   * Initialize event listeners
   */
  const initialize = () => {
    // Listen to ALL game events - same simple handler for all
    // Just check state and act if needed
    gameEventBus.onGameEvent(WebSocketEvent.GAME_STARTED, (p) => handleGameEvent('GAME_STARTED', p));
    gameEventBus.onGameEvent(WebSocketEvent.ROUND_STARTED, (p) => handleGameEvent('ROUND_STARTED', p));
    gameEventBus.onGameEvent(WebSocketEvent.TURN_ENDED, (p) => handleGameEvent('TURN_ENDED', p));
    gameEventBus.onGameEvent(WebSocketEvent.CLUE_GIVEN, (p) => handleGameEvent('CLUE_GIVEN', p));
    gameEventBus.onGameEvent(WebSocketEvent.GUESS_MADE, (p) => handleGameEvent('GUESS_MADE', p));

    console.log("[AI Player Service] Initialized and listening for game events");
  };

  return {
    initialize,
  };
};

export type AIPlayerService = ReturnType<typeof createAIPlayerService>;
