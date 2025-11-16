/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { LocalLLMService } from "../llm/local-llm.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { GameplayStateProvider } from "@backend/gameplay/state/gameplay-state.provider";
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
   * Check if a player is an AI and should act
   */
  const shouldAIAct = async (
    gameId: string,
    playerId: string,
  ): Promise<AIDecisionContext | null> => {
    // Query database to check if player is AI
    // For now, we'll use a simple query (you'll need to add this to your repo)
    const db = await import("@backend/common/data-access/database");
    const result = await db.default.query<{
      is_ai: boolean;
      user_id: number;
      role_name: string | null;
    }>(
      `
      SELECT p.is_ai, p.user_id, pr.role_name
      FROM players p
      LEFT JOIN player_round_roles prr ON p.id = prr.player_id
      LEFT JOIN player_roles pr ON prr.role_id = pr.id
      JOIN games g ON p.game_id = g.id
      JOIN rounds r ON g.id = r.game_id AND r.is_current = true
      WHERE p.public_id = $1 AND g.public_id = $2
      LIMIT 1
    `,
      [playerId, gameId],
    );

    if (result.rows.length === 0 || !result.rows[0].is_ai) {
      return null;
    }

    const row = result.rows[0];
    const role = row.role_name as "CODEMASTER" | "CODEBREAKER" | null;

    if (!role) {
      return null;
    }

    // Get current round number
    const gameState = await getGameState(gameId, row.user_id, playerId);
    if (gameState.status !== "success") {
      return null;
    }

    return {
      gameId,
      playerId,
      userId: row.user_id,
      role,
      roundNumber: gameState.data.currentRound.number,
    };
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

      if (gameState.status !== "success") {
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
        .filter((c) => c.teamName === myTeam && !c.selected)
        .map((c) => c.word);
      const opponentCards = cards
        .filter((c) => c.teamName && c.teamName !== myTeam && !c.selected)
        .map((c) => c.word);
      const assassinCard =
        cards.find((c) => c.cardType === "ASSASSIN" && !c.selected)?.word ||
        "UNKNOWN";
      const bystanderCards = cards
        .filter((c) => c.cardType === "BYSTANDER" && !c.selected)
        .map((c) => c.word);

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
        word: string;
        count: number;
      }>(prompt);

      console.log(
        `[AI] ${context.playerId} giving clue: ${decision.word} for ${decision.count}`,
      );

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

      if (gameState.status !== "success") {
        console.error(`[AI] Failed to get game state for ${context.playerId}`);
        return;
      }

      const currentTurn = gameState.data.currentRound.turns.at(-1);
      if (!currentTurn || !currentTurn.clue) {
        console.error(`[AI] No clue found for ${context.playerId}`);
        return;
      }

      const availableCards = gameState.data.currentRound.cards
        .filter((c) => !c.selected)
        .map((c) => c.word);

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

      // Get AI decision
      const decision = await llm.generateJSON<{ card: string }>(prompt);

      console.log(`[AI] ${context.playerId} guessing: ${decision.card}`);

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
      } else {
        console.log(
          `[AI] Guess result: ${result.data.guess.outcome}`,
        );
      }
    } catch (error) {
      console.error(`[AI] Error making guess:`, error);
    } finally {
      activeDecisions.delete(decisionKey);
    }
  };

  /**
   * Handle turn ended event - check if an AI codemaster needs to give a clue
   */
  const handleTurnEnded = async (payload: GameplayEventPayload) => {
    // Small delay to ensure database is updated
    await randomDelay(500, 1000);

    // Get current game state to find whose turn it is now
    const db = await import("@backend/common/data-access/database");
    const result = await db.default.query<{
      player_public_id: string;
      is_ai: boolean;
      user_id: number;
      role_name: string;
      has_clue: boolean;
    }>(
      `
      SELECT
        p.public_id as player_public_id,
        p.is_ai,
        p.user_id,
        pr.role_name,
        (c.id IS NOT NULL) as has_clue
      FROM turns t
      JOIN teams tm ON t.team_id = tm.id
      JOIN players p ON p.team_id = tm.id
      JOIN player_round_roles prr ON p.id = prr.player_id
      JOIN player_roles pr ON prr.role_id = pr.id
      LEFT JOIN clues c ON t.id = c.turn_id
      WHERE t.public_id = $1
        AND t.status = 'ACTIVE'
        AND pr.role_name = 'CODEMASTER'
      LIMIT 1
    `,
      [payload.turnId!],
    );

    if (result.rows.length === 0) {
      return;
    }

    const row = result.rows[0];

    // If it's an AI codemaster and no clue yet, give one
    if (row.is_ai && !row.has_clue && row.role_name === "CODEMASTER") {
      const context: AIDecisionContext = {
        gameId: payload.gameId,
        playerId: row.player_public_id,
        userId: row.user_id,
        role: "CODEMASTER",
        roundNumber: payload.roundNumber!,
      };

      await aiGiveClue(context);
    }
  };

  /**
   * Handle clue given event - check if AI codebreakers need to guess
   */
  const handleClueGiven = async (payload: GameplayEventPayload) => {
    // Small delay
    await randomDelay(500, 1000);

    // Find AI codebreakers on the team whose turn it is
    const db = await import("@backend/common/data-access/database");
    const result = await db.default.query<{
      player_public_id: string;
      user_id: number;
    }>(
      `
      SELECT
        p.public_id as player_public_id,
        p.user_id
      FROM turns t
      JOIN teams tm ON t.team_id = tm.id
      JOIN players p ON p.team_id = tm.id
      JOIN player_round_roles prr ON p.id = prr.player_id
      JOIN player_roles pr ON prr.role_id = pr.id
      WHERE t.public_id = $1
        AND t.status = 'ACTIVE'
        AND p.is_ai = true
        AND pr.role_name = 'CODEBREAKER'
      LIMIT 1
    `,
      [payload.turnId!],
    );

    if (result.rows.length === 0) {
      return;
    }

    const row = result.rows[0];
    const context: AIDecisionContext = {
      gameId: payload.gameId,
      playerId: row.player_public_id,
      userId: row.user_id,
      role: "CODEBREAKER",
      roundNumber: payload.roundNumber!,
    };

    await aiMakeGuess(context);
  };

  /**
   * Handle guess made event - check if AI codebreaker should guess again
   */
  const handleGuessMade = async (payload: GameplayEventPayload) => {
    // Small delay
    await randomDelay(500, 1000);

    // Check if the guess was correct and there are guesses remaining
    const db = await import("@backend/common/data-access/database");
    const result = await db.default.query<{
      player_public_id: string;
      user_id: number;
      guesses_remaining: number;
      last_outcome: string;
    }>(
      `
      SELECT
        p.public_id as player_public_id,
        p.user_id,
        t.guesses_remaining,
        g.outcome as last_outcome
      FROM turns t
      JOIN teams tm ON t.team_id = tm.id
      JOIN players p ON p.team_id = tm.id
      JOIN player_round_roles prr ON p.id = prr.player_id
      JOIN player_roles pr ON prr.role_id = pr.id
      JOIN guesses g ON g.turn_id = t.id
      WHERE t.public_id = $1
        AND t.status = 'ACTIVE'
        AND p.is_ai = true
        AND pr.role_name = 'CODEBREAKER'
        AND g.id = (SELECT MAX(id) FROM guesses WHERE turn_id = t.id)
      LIMIT 1
    `,
      [payload.turnId!],
    );

    if (result.rows.length === 0) {
      return;
    }

    const row = result.rows[0];

    // Only guess again if last guess was correct and guesses remain
    if (row.last_outcome === "CORRECT" && row.guesses_remaining > 0) {
      const context: AIDecisionContext = {
        gameId: payload.gameId,
        playerId: row.player_public_id,
        userId: row.user_id,
        role: "CODEBREAKER",
        roundNumber: payload.roundNumber!,
      };

      await aiMakeGuess(context);
    }
  };

  /**
   * Initialize event listeners
   */
  const initialize = () => {
    gameEventBus.onGameEvent(WebSocketEvent.TURN_ENDED, handleTurnEnded);
    gameEventBus.onGameEvent(WebSocketEvent.CLUE_GIVEN, handleClueGiven);
    gameEventBus.onGameEvent(WebSocketEvent.GUESS_MADE, handleGuessMade);

    console.log("[AI Player Service] Initialized and listening for game events");
  };

  return {
    initialize,
  };
};

export type AIPlayerService = ReturnType<typeof createAIPlayerService>;
