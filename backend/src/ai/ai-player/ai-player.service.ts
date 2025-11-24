/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { LocalLLMService } from "../llm/local-llm.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { EndTurnService } from "@backend/gameplay/end-turn/end-turn.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import { gameEventBus } from "../events/game-event-bus";
import { WebSocketEvent } from "@backend/common/websocket/websocket-events.types";

import { createCodenamesPipeline } from "../llm/codenames-pipeline";
import type {
  RunCreator,
  RunFinderByGame,
  RunStatusUpdater,
  SpymasterResponse,
  PrefilterResponse,
  RankerResponse,
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import {
  PIPELINE_TYPE,
  PIPELINE_STATUS,
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import type { MessageCreator } from "@backend/common/data-access/repositories/game-messages.repository";
import { MESSAGE_TYPE } from "@backend/common/data-access/repositories/game-messages.repository";
import { GameEventsEmitter } from "@backend/common/websocket";
import type { GameFinder } from "@backend/common/data-access/repositories/games.repository";

export type AIPlayerDependencies = {
  llm: LocalLLMService;
  giveClue: GiveClueService;
  makeGuess: MakeGuessService;
  endTurn: EndTurnService;
  getGameState: GameplayStateProvider;
  // Repository functions
  createPipelineRun: RunCreator;
  findRunningPipeline: RunFinderByGame;
  updatePipelineStatus: RunStatusUpdater;
  updateSpymasterResponse: (runId: string, response: SpymasterResponse) => Promise<void>;
  updatePrefilterResponse: (runId: string, response: PrefilterResponse) => Promise<void>;
  updateRankerResponse: (runId: string, response: RankerResponse) => Promise<void>;
  createGameMessage: MessageCreator;
  findGameByPublicId: GameFinder<string>;
};

type AIDecisionContext = {
  gameId: string;
  playerId: string;
  userId: number;
  role: "CODEMASTER" | "CODEBREAKER";
  roundNumber: number;
  teamId: number;
  teamName: string;
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
  const {
    llm,
    giveClue,
    makeGuess,
    endTurn,
    getGameState,
    createPipelineRun,
    findRunningPipeline,
    updatePipelineStatus,
    updateSpymasterResponse,
    updatePrefilterResponse,
    updateRankerResponse,
    createGameMessage,
    findGameByPublicId,
  } = dependencies;

  const pipeline = createCodenamesPipeline(llm);

  /**
   * Emit a narration message for AI thinking
   */
  const emitNarration = async (context: AIDecisionContext, content: string): Promise<void> => {
    try {
      // Get internal game ID
      const game = await findGameByPublicId(context.gameId);
      if (!game) {
        console.error(`[AI] Game ${context.gameId} not found for narration`);
        return;
      }

      const message = await createGameMessage({
        gameId: game._id,
        playerId: null, // AI narration has no player
        teamId: context.teamId,
        teamOnly: true,
        messageType: MESSAGE_TYPE.AI_THINKING,
        content,
      });

      GameEventsEmitter.gameMessageCreated(
        context.gameId,
        message.id,
        MESSAGE_TYPE.AI_THINKING,
        context.teamId,
      );
    } catch (error) {
      console.error("[AI] Failed to emit narration:", error);
    }
  };

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
            teamId: aiCodemaster._teamId,
            teamName: aiCodemaster.teamName,
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
            teamId: aiCodebreaker._teamId,
            teamName: aiCodebreaker.teamName,
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

    // Get internal game ID and player ID for DB operations
    const game = await findGameByPublicId(context.gameId);
    if (!game) {
      console.error(`[AI] Game ${context.gameId} not found`);
      activeDecisions.delete(decisionKey);
      return;
    }

    // Create pipeline run
    let run;
    try {
      run = await createPipelineRun({
        gameId: game._id,
        playerId: context.userId, // Using userId as playerId since it's the internal ID
        pipelineType: PIPELINE_TYPE.SPYMASTER,
      });

      console.log(`[AI] Created pipeline run ${run.id} for ${context.playerId}`);
      GameEventsEmitter.aiPipelineStarted(context.gameId, run.id, PIPELINE_TYPE.SPYMASTER);
    } catch (error) {
      console.error(`[AI] Failed to create pipeline run:`, error);
      activeDecisions.delete(decisionKey);
      return;
    }

    try {
      await randomDelay(1000, 3000);

      await emitNarration(context, "🤔 Analyzing the board and thinking of a clever clue...");

      const gameState = await getGameState(context.gameId, context.userId, context.playerId);

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        throw new Error("Failed to get game state");
      }

      const cards = gameState.data.currentRound.cards;
      const myTeam = gameState.data.playerContext?.teamName;

      if (!myTeam) {
        throw new Error("No team found");
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
        throw new Error("No cards left");
      }

      const previousClues = gameState.data.currentRound.turns
        .filter((t: any) => t.clue && t.clue.word)
        .map((t: any) => t.clue.word);

      console.log(`[AI Pipeline] Running Spymaster pipeline for ${context.playerId}`);
      console.log(`[AI Pipeline] ${friendlyWords.length} team cards remaining`);
      if (previousClues.length > 0) {
        console.log(
          `[AI Pipeline] ${previousClues.length} clues already used: ${previousClues.join(", ")}`,
        );
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

      // Store spymaster response
      const spymasterResponse: SpymasterResponse = {
        clue: {
          word: pipelineResult.clue,
          targetCardCount: pipelineResult.number,
        },
        reasoning: pipelineResult.explanation,
      };
      await updateSpymasterResponse(run.id, spymasterResponse);

      await emitNarration(
        context,
        `💡 I've got it! The clue is "${pipelineResult.clue}" for ${pipelineResult.number}`,
      );

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
        throw new Error(`Failed to give clue: ${clueResult.error}`);
      }

      // Mark complete
      await updatePipelineStatus(run.id, PIPELINE_STATUS.COMPLETE);
      GameEventsEmitter.aiPipelineComplete(context.gameId, run.id);

      console.log(`[AI] Spymaster pipeline complete for run ${run.id}`);
    } catch (error) {
      console.error(`[AI] Error giving clue:`, error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      await updatePipelineStatus(run.id, PIPELINE_STATUS.FAILED, errorMsg);
      GameEventsEmitter.aiPipelineFailed(context.gameId, run.id, errorMsg);

      await emitNarration(context, "❌ Oops! Something went wrong while thinking of a clue.");
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

    // Get internal game ID for DB operations
    const game = await findGameByPublicId(context.gameId);
    if (!game) {
      console.error(`[AI] Game ${context.gameId} not found`);
      activeDecisions.delete(decisionKey);
      return;
    }

    // Create pipeline run
    let run;
    try {
      run = await createPipelineRun({
        gameId: game._id,
        playerId: context.userId, // Using userId as playerId since it's the internal ID
        pipelineType: PIPELINE_TYPE.GUESSER,
      });

      console.log(`[AI] Created pipeline run ${run.id} for ${context.playerId}`);
      GameEventsEmitter.aiPipelineStarted(context.gameId, run.id, PIPELINE_TYPE.GUESSER);
    } catch (error) {
      console.error(`[AI] Failed to create pipeline run:`, error);
      activeDecisions.delete(decisionKey);
      return;
    }

    try {
      await randomDelay(2000, 4000);

      const gameState = await getGameState(context.gameId, context.userId, context.playerId);

      if (gameState.status !== "found" || !gameState.data.currentRound) {
        throw new Error("Failed to get game state");
      }

      const currentTurn = gameState.data.currentRound.turns.at(-1);
      if (!currentTurn || !currentTurn.clue) {
        throw new Error("No clue found");
      }

      const remainingWords = gameState.data.currentRound.cards
        .filter((c: any) => !c.selected)
        .map((c: any) => c.word);

      if (remainingWords.length === 0) {
        throw new Error("No cards available");
      }

      const myTeam = currentTurn.teamName;
      const clueNumber = currentTurn.clue.number;

      // STAGE 1: Pre-filter
      await emitNarration(
        context,
        `🔍 Looking at the clue "${currentTurn.clue.word}"... filtering through ${remainingWords.length} words...`,
      );
      GameEventsEmitter.aiPipelineStage(context.gameId, run.id, "prefilter");

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
        console.log(
          `[AI] ${context.playerId} decided to stop guessing: ${operativeDecision.reason}`,
        );
        console.log(`[AI] Ending turn due to insufficient candidates`);

        await emitNarration(context, "🤷 Hmm, none of these words feel right. I'll pass.");

        const endTurnResult = await endTurn({
          gameId: context.gameId,
          roundNumber: context.roundNumber,
          userId: context.userId,
          playerId: context.playerId,
        });

        if (!endTurnResult.success) {
          throw new Error(`Failed to end turn: ${endTurnResult.error}`);
        }

        // Mark complete
        await updatePipelineStatus(run.id, PIPELINE_STATUS.COMPLETE);
        GameEventsEmitter.aiPipelineComplete(context.gameId, run.id);

        console.log(`[AI] Turn ended successfully`);
        return;
      }

      const rankedList = operativeDecision.rankedList;
      if (!rankedList || rankedList.length === 0) {
        throw new Error("No ranked list returned from pipeline");
      }

      // Store prefilter response
      const prefilterResponse: PrefilterResponse = {
        candidateWords: rankedList.map((r) => r.word),
        reasoning: operativeDecision.reason,
      };
      await updatePrefilterResponse(run.id, prefilterResponse);

      // STAGE 2: Ranking (already done by pipeline)
      await emitNarration(
        context,
        `🎯 Found ${rankedList.length} good candidates! Ranking them now...`,
      );
      GameEventsEmitter.aiPipelineStage(context.gameId, run.id, "ranker");

      // Store ranker response
      const rankerResponse: RankerResponse = {
        rankedWords: rankedList.map((r) => ({
          word: r.word,
          score: r.score,
          reasoning: r.reason,
        })),
      };
      await updateRankerResponse(run.id, rankerResponse);

      console.log(`[AI] Making up to ${clueNumber} guess(es) sequentially...`);
      console.log(`[AI] Ranked list has ${rankedList.length} candidates`);

      const maxGuesses = Math.min(clueNumber, rankedList.length);
      await emitNarration(context, `✨ Ready to make up to ${maxGuesses} guess(es). Let's go!`);

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
          throw new Error(`Failed to make guess: ${result.error}`);
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
              throw new Error(`Failed to end turn: ${endTurnResult.error}`);
            }

            console.log(`[AI] Turn ended successfully`);
            break;
          }

          console.log(`[AI] Waiting 5 seconds before next guess...`);
          await randomDelay(5000, 5000);
        } else {
          console.log(`[AI] Wrong guess (${outcome}), turn will auto-end`);
          break;
        }
      }

      // Mark complete
      await updatePipelineStatus(run.id, PIPELINE_STATUS.COMPLETE);
      GameEventsEmitter.aiPipelineComplete(context.gameId, run.id);

      console.log(`[AI] Guesser pipeline complete for run ${run.id}`);
    } catch (error) {
      console.error(`[AI] Error making guesses:`, error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      await updatePipelineStatus(run.id, PIPELINE_STATUS.FAILED, errorMsg);
      GameEventsEmitter.aiPipelineFailed(context.gameId, run.id, errorMsg);

      await emitNarration(context, "❌ Oops! Something went wrong while making guesses.");
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
    checkAndActIfNeeded, // Expose for manual triggering
  };
};

export type AIPlayerService = ReturnType<typeof createAIPlayerService>;
