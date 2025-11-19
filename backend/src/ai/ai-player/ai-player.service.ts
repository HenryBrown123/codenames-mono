/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { LocalLLMService } from "../llm/local-llm.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { EndTurnService } from "@backend/gameplay/end-turn/end-turn.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import type { TurnFinder } from "@backend/common/data-access/repositories/turns.repository";
import type { PlayerFinderAll } from "@backend/common/data-access/repositories/players.repository";
import { gameEventBus } from "../events/game-event-bus";
import { WebSocketEvent } from "@backend/common/websocket/websocket-events.types";
import type { GameplayEventPayload } from "@backend/common/websocket/websocket-events.types";
import { createCodenamesPipeline } from "../llm/codenames-pipeline";

export type AIPlayerDependencies = {
  llm: LocalLLMService;
  giveClue: GiveClueService;
  makeGuess: MakeGuessService;
  endTurn: EndTurnService;
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
  const { llm, giveClue, makeGuess, endTurn, getGameState } = dependencies;

  const pipeline = createCodenamesPipeline(llm);

  /**
   * Check current game state and determine if AI should act
   */
  const checkAndActIfNeeded = async (gameId: string) => {
    try {
      console.log(`[AI] checkAndActIfNeeded called for game ${gameId}`);

      const gameState = await getGameState(gameId, 0, null);

      if (gameState.status !== "found") {
        console.log(`[AI] Game ${gameId} not found`);
        return;
      }

      if (!gameState.data.currentRound) {
        console.log(`[AI] No current round for game ${gameId}`);
        return;
      }

      const currentRound = gameState.data.currentRound;
      const turns = currentRound.turns;
      if (!turns || turns.length === 0) {
        console.log(`[AI] No turns yet for game ${gameId}`);
        return;
      }

      const currentTurn = turns[turns.length - 1];
      if (!currentTurn) {
        return;
      }

      const allPlayers = gameState.data.teams.flatMap((team) => team.players);

      if (!currentTurn.clue) {
        const teamName = currentTurn.teamName;

        console.log(`[AI] Checking for AI codemaster on ${teamName} team`);
        console.log(
          `[AI] All players:`,
          allPlayers.map((p) => ({
            name: p.publicName,
            team: p.teamName,
            role: p.role,
            isAi: p.isAi,
          })),
        );

        const aiCodemaster = allPlayers.find(
          (p) => p.teamName === teamName && p.isAi && p.role === "CODEMASTER",
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
          return;
        }
      }

      if (currentTurn.clue && currentTurn.guessesRemaining > 0) {
        const teamName = currentTurn.teamName;

        const teamCodebreakers = allPlayers.filter(
          (p) => p.teamName === teamName && p.role === "CODEBREAKER",
        );

        const allCodebreakersAreAI =
          teamCodebreakers.length > 0 && teamCodebreakers.every((p) => p.isAi);

        if (allCodebreakersAreAI) {
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
          return;
        }
      }
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
      await randomDelay(1000, 3000);

      const gameState = await getGameState(context.gameId, context.userId, context.playerId);

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

      const friendlyWords = cards
        .filter((c: any) => c.teamName === myTeam && !c.selected)
        .map((c: any) => c.word);
      const opponentWords = cards
        .filter((c: any) => c.teamName && c.teamName !== myTeam && !c.selected)
        .map((c: any) => c.word);
      const assassinWord =
        cards.find((c: any) => c.cardType === "ASSASSIN" && !c.selected)?.word || "UNKNOWN";
      const neutralWords = cards
        .filter((c: any) => c.cardType === "BYSTANDER" && !c.selected)
        .map((c: any) => c.word);

      if (friendlyWords.length === 0) {
        console.log(`[AI] No cards left for ${context.playerId}`);
        return;
      }

      const previousClues = gameState.data.currentRound.turns
        .filter((t: any) => t.clue && t.clue.word)
        .map((t: any) => t.clue.word);

      console.log(`[AI Pipeline] Running Spymaster pipeline for ${context.playerId}`);
      console.log(`[AI Pipeline] ${friendlyWords.length} team cards remaining`);
      if (previousClues.length > 0) {
        console.log(`[AI Pipeline] ${previousClues.length} clues already used: ${previousClues.join(", ")}`);
      }

      const pipelineResult = await pipeline.runSpymasterPipeline({
        currentTeam: myTeam,
        friendlyWords,
        opponentWords,
        neutralWords,
        assassinWord,
        previousClues,
      });

      console.log(`[AI Pipeline] Pipeline complete`);
      console.log(
        `[AI Pipeline] Chosen clue: "${pipelineResult.clue}" for ${pipelineResult.number}`,
      );
      console.log(`[AI Pipeline] Explanation: ${pipelineResult.explanation}`);

      const decision = {
        word: pipelineResult.clue,
        count: pipelineResult.number,
      };

      console.log(`[AI] ${context.playerId} giving clue: ${decision.word} for ${decision.count}`);

      const clueResult = await giveClue({
        gameId: context.gameId,
        roundNumber: context.roundNumber,
        userId: context.userId,
        playerId: context.playerId,
        word: decision.word,
        targetCardCount: decision.count,
      });

      if (!clueResult.success) {
        console.error(`[AI] Failed to give clue:`, clueResult.error);
      }
    } catch (error) {
      console.error(`[AI] Error giving clue:`, error);
    } finally {
      activeDecisions.delete(decisionKey);
    }
  };

  /**
   * AI makes guesses as CODEBREAKER
   * Runs pipeline ONCE, then makes guesses sequentially from ranked list
   */
  const aiMakeGuess = async (context: AIDecisionContext): Promise<void> => {
    const decisionKey = `guess:${context.gameId}:${context.playerId}`;

    if (activeDecisions.has(decisionKey)) {
      console.log(`[AI] Already processing guesses for ${context.playerId}`);
      return;
    }

    activeDecisions.add(decisionKey);

    try {
      await randomDelay(2000, 4000);

      const gameState = await getGameState(context.gameId, context.userId, context.playerId);

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        console.error(`[AI] Failed to get game state for ${context.playerId}`);
        return;
      }

      const currentTurn = gameState.data.currentRound.turns.at(-1);
      if (!currentTurn || !currentTurn.clue) {
        console.error(`[AI] No clue found for ${context.playerId}`);
        return;
      }

      const remainingWords = gameState.data.currentRound.cards
        .filter((c: any) => !c.selected)
        .map((c: any) => c.word);

      if (remainingWords.length === 0) {
        console.log(`[AI] No cards available for ${context.playerId}`);
        return;
      }

      const myTeam = currentTurn.teamName;
      const clueNumber = currentTurn.clue.number;

      console.log(`[AI Pipeline] Running Guesser pipeline for ${context.playerId}`);
      console.log(`[AI Pipeline] Clue: "${currentTurn.clue.word}" for ${clueNumber}`);
      console.log(`[AI Pipeline] Planning to make up to ${clueNumber} guesses`);

      const operativeDecision = await pipeline.runOperativePipeline({
        currentTeam: myTeam,
        remainingWords,
        clueWord: currentTurn.clue.word,
        clueNumber: currentTurn.clue.number,
      });

      console.log(`[AI Pipeline] Pipeline complete`);
      console.log(`[AI Pipeline] Decision: ${operativeDecision.action}`);

      if (operativeDecision.action === "stop") {
        console.log(`[AI] ${context.playerId} decided to stop guessing: ${operativeDecision.reason}`);
        console.log(`[AI] Ending turn due to insufficient candidates`);

        const endTurnResult = await endTurn({
          gameId: context.gameId,
          roundNumber: context.roundNumber,
          userId: context.userId,
          playerId: context.playerId,
        });

        if (!endTurnResult.success) {
          console.error(`[AI] Failed to end turn:`, endTurnResult.error);
        } else {
          console.log(`[AI] Turn ended successfully`);
        }
        return;
      }

      const rankedList = operativeDecision.rankedList;
      if (!rankedList || rankedList.length === 0) {
        console.error(`[AI] No ranked list returned from pipeline`);
        return;
      }

      console.log(`[AI] Making up to ${clueNumber} guess(es) sequentially...`);
      console.log(`[AI] Ranked list has ${rankedList.length} candidates`);

      let correctGuesses = 0;

      for (let i = 0; i < Math.min(clueNumber, rankedList.length); i++) {
        const candidate = rankedList[i];

        console.log(
          `[AI] Guess ${i + 1}/${clueNumber}: "${candidate.word}" (score: ${candidate.score.toFixed(2)})`,
        );

        const result = await makeGuess({
          gameId: context.gameId,
          roundNumber: context.roundNumber,
          userId: context.userId,
          playerId: context.playerId,
          cardWord: candidate.word,
        });

        if (!result.success) {
          console.error(`[AI] Failed to make guess:`, result.error);
          break;
        }

        const outcome = result.data.guess.outcome;
        console.log(`[AI] Result: ${outcome}`);

        if (outcome === "CORRECT_TEAM_CARD") {
          correctGuesses++;

          if (correctGuesses >= clueNumber) {
            console.log(`[AI] Made ${correctGuesses} correct guesses, calling endTurn`);

            const endTurnResult = await endTurn({
              gameId: context.gameId,
              roundNumber: context.roundNumber,
              userId: context.userId,
              playerId: context.playerId,
            });

            if (!endTurnResult.success) {
              console.error(`[AI] Failed to end turn:`, endTurnResult.error);
            } else {
              console.log(`[AI] Turn ended successfully`);
            }
            break;
          }

          console.log(`[AI] Waiting 5 seconds before next guess...`);
          await randomDelay(5000, 5000);
        } else {
          console.log(`[AI] Wrong guess (${outcome}), turn will auto-end`);
          break;
        }
      }
    } catch (error) {
      console.error(`[AI] Error making guesses:`, error);
    } finally {
      activeDecisions.delete(decisionKey);
    }
  };

  /**
   * Generic handler for ALL game events
   */
  const handleGameEvent = async (eventName: string, payload: any) => {
    console.log(`[AI] ${eventName} event received for game ${payload.gameId}`);

    await randomDelay(500, 1000);
    await checkAndActIfNeeded(payload.gameId);
  };

  /**
   * Initialize event listeners
   */
  const initialize = () => {
    gameEventBus.onGameEvent(WebSocketEvent.GAME_STARTED, (p) =>
      handleGameEvent("GAME_STARTED", p),
    );
    gameEventBus.onGameEvent(WebSocketEvent.ROUND_STARTED, (p) =>
      handleGameEvent("ROUND_STARTED", p),
    );
    gameEventBus.onGameEvent(WebSocketEvent.TURN_ENDED, (p) => handleGameEvent("TURN_ENDED", p));
    gameEventBus.onGameEvent(WebSocketEvent.CLUE_GIVEN, (p) => handleGameEvent("CLUE_GIVEN", p));
    gameEventBus.onGameEvent(WebSocketEvent.PLAYER_JOINED, (p) =>
      handleGameEvent("PLAYER_JOINED", p),
    );

    console.log("[AI Player Service] Initialized and listening for game events");
  };

  return {
    initialize,
  };
};

export type AIPlayerService = ReturnType<typeof createAIPlayerService>;
