/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
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
  db: Kysely<DB>;
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
  const { db, llm, giveClue, makeGuess, getGameState } = dependencies;

  /**
   * Check if a player is an AI and should act
   */
  const shouldAIAct = async (
    gameId: string,
    playerId: string,
  ): Promise<AIDecisionContext | null> => {
    // Query database to check if player is AI
    const result = await db
      .selectFrom("players as p")
      .leftJoin("player_round_roles as prr", "p.id", "prr.player_id")
      .leftJoin("player_roles as pr", "prr.role_id", "pr.id")
      .innerJoin("games as g", "p.game_id", "g.id")
      .innerJoin("rounds as r", (join:any) =>
        join.onRef("g.id", "=", "r.game_id").on("r.is_current", "=", true)
      )
      .select(["p.is_ai", "p.user_id", "pr.role_name"])
      .where("p.public_id", "=", playerId)
      .where("g.public_id", "=", gameId)
      .limit(1)
      .executeTakeFirst();

    if (!result || !result.is_ai) {
      return null;
    }

    const role = result.role_name as "CODEMASTER" | "CODEBREAKER" | null;

    if (!role) {
      return null;
    }

    // Get current round number
    const gameState = await getGameState(gameId, result.user_id, playerId);
    if (gameState.status !== "found" || !gameState.data.currentRound) {
      return null;
    }

    return {
      gameId,
      playerId,
      userId: result.user_id,
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

    // First get the turn and check if it has a clue
    const turn = await db
      .selectFrom("turns")
      .leftJoin("clues", "turns.id", "clues.turn_id")
      .select(["turns.id", "turns.team_id", "turns.status", "clues.id as clue_id"])
      .where("turns.public_id", "=", payload.turnId!)
      .where("turns.status", "=", "ACTIVE")
      .executeTakeFirst();

    if (!turn || turn.clue_id) {
      // Turn not found or already has a clue
      return;
    }

    // Find AI codemaster on this team
    const aiCodemaster = await db
      .selectFrom("players as p")
      .innerJoin("player_round_roles as prr", "p.id", "prr.player_id")
      .innerJoin("player_roles as pr", "prr.role_id", "pr.id")
      .select(["p.public_id as player_public_id", "p.user_id", "p.is_ai"])
      .where("p.team_id", "=", turn.team_id)
      .where("pr.role_name", "=", "CODEMASTER")
      .where("p.is_ai", "=", true)
      .limit(1)
      .executeTakeFirst();

    if (!aiCodemaster) {
      return;
    }

    const context: AIDecisionContext = {
      gameId: payload.gameId,
      playerId: aiCodemaster.player_public_id,
      userId: aiCodemaster.user_id,
      role: "CODEMASTER",
      roundNumber: payload.roundNumber!,
    };

    await aiGiveClue(context);
  };

  /**
   * Handle clue given event - check if AI codebreakers need to guess
   */
  const handleClueGiven = async (payload: GameplayEventPayload) => {
    // Small delay
    await randomDelay(500, 1000);

    // Get the turn to find which team it is
    const turn = await db
      .selectFrom("turns")
      .select(["team_id", "status"])
      .where("public_id", "=", payload.turnId!)
      .where("status", "=", "ACTIVE")
      .executeTakeFirst();

    if (!turn) {
      return;
    }

    // Find AI codebreaker on this team
    const aiCodebreaker = await db
      .selectFrom("players as p")
      .innerJoin("player_round_roles as prr", "p.id", "prr.player_id")
      .innerJoin("player_roles as pr", "prr.role_id", "pr.id")
      .select(["p.public_id as player_public_id", "p.user_id"])
      .where("p.team_id", "=", turn.team_id)
      .where("p.is_ai", "=", true)
      .where("pr.role_name", "=", "CODEBREAKER")
      .limit(1)
      .executeTakeFirst();

    if (!aiCodebreaker) {
      return;
    }

    const context: AIDecisionContext = {
      gameId: payload.gameId,
      playerId: aiCodebreaker.player_public_id,
      userId: aiCodebreaker.user_id,
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

    // First get the turn info
    const turn = await db
      .selectFrom("turns")
      .select(["id", "team_id", "guesses_remaining", "status"])
      .where("public_id", "=", payload.turnId!)
      .where("status", "=", "ACTIVE")
      .executeTakeFirst();

    if (!turn || turn.guesses_remaining <= 0) {
      return;
    }

    // Get the most recent guess for this turn
    const lastGuess = await db
      .selectFrom("guesses")
      .select("outcome")
      .where("turn_id", "=", turn.id)
      .orderBy("id", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!lastGuess || lastGuess.outcome !== "CORRECT") {
      return;
    }

    // Find AI codebreaker on this team
    const aiPlayer = await db
      .selectFrom("players as p")
      .innerJoin("player_round_roles as prr", "p.id", "prr.player_id")
      .innerJoin("player_roles as pr", "prr.role_id", "pr.id")
      .select(["p.public_id as player_public_id", "p.user_id"])
      .where("p.team_id", "=", turn.team_id)
      .where("p.is_ai", "=", true)
      .where("pr.role_name", "=", "CODEBREAKER")
      .limit(1)
      .executeTakeFirst();

    if (!aiPlayer) {
      return;
    }

    const context: AIDecisionContext = {
      gameId: payload.gameId,
      playerId: aiPlayer.player_public_id,
      userId: aiPlayer.user_id,
      role: "CODEBREAKER",
      roundNumber: payload.roundNumber!,
    };

    await aiMakeGuess(context);
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
