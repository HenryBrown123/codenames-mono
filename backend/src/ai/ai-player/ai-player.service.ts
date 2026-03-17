/**
 * AI Player Service
 * Listens to game events and makes intelligent decisions for AI players
 */

import type { LocalLLMService } from "../llm/local-llm.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { EndTurnService } from "@backend/gameplay/end-turn/end-turn.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import { createCodenamesPipeline } from "../llm/codenames-pipeline";
import type { PreFilterOutput } from "../llm/guesser-prefilter";
import type {
  RunCreator,
  RunFinderByGame,
  RunStatusUpdater,
  SpymasterResponse,
  PrefilterResponse,
  RankerResponse,
  PromptAppender,
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import {
  PIPELINE_TYPE,
  PIPELINE_STATUS,
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import type { MessageCreator } from "@backend/common/data-access/repositories/game-messages.repository";
import { MESSAGE_TYPE } from "@backend/common/data-access/repositories/game-messages.repository";
import { GameEventsEmitter } from "@backend/common/websocket";
import type { GameFinder } from "@backend/common/data-access/repositories/games.repository";
import type { AppLogger } from "@backend/common/logging";

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
  appendPrompt: PromptAppender;
  createGameMessage: MessageCreator;
  findGameByPublicId: GameFinder<string>;
};

type AIDecisionContext = {
  gameId: string;
  playerId: string;
  playerInternalId: number; // The player's _id from players table
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
 * Delay utility for waiting between guesses
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Creates the AI player service
 */
export const createAIPlayerService =
  (logger: AppLogger) => (dependencies: AIPlayerDependencies) => {
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
      appendPrompt,
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
          return;
        }

        const message = await createGameMessage({
          gameId: game._id,
          playerId: null, // AI narration has no player
          teamId: context.teamId,
          teamOnly: false,
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
        logger.warn("emitNarration failed", {
          gameId: context.gameId,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    };

    /**
     * Check current game state and determine if AI should act
     */
    const checkAndActIfNeeded = async (gameId: string) => {
      logger.debug("checkAndActIfNeeded START", { gameId });

      try {
        const gameState = await getGameState(gameId, 0, null);

        if (gameState.status !== "found") {
          logger.warn("checkAndActIfNeeded: game not found", { gameId, status: gameState.status });
          return;
        }

        if (!gameState.data.currentRound) {
          logger.debug("checkAndActIfNeeded: no current round", { gameId });
          return;
        }

        const currentRound = gameState.data.currentRound;
        const turns = currentRound.turns;
        if (!turns || turns.length === 0) {
          logger.debug("checkAndActIfNeeded: no turns", { gameId });
          return;
        }

        const currentTurn = turns[turns.length - 1];
        if (!currentTurn) {
          logger.debug("checkAndActIfNeeded: no current turn", { gameId });
          return;
        }

        logger.debug("checkAndActIfNeeded: checking turn state", {
          gameId,
          turnStatus: currentTurn.status,
          hasClue: !!currentTurn.clue,
          clueWord: currentTurn.clue?.word,
          guessesRemaining: currentTurn.guessesRemaining,
          teamName: currentTurn.teamName,
        });

        // Only act on active turns
        if (currentTurn.status !== "ACTIVE") {
          logger.debug("checkAndActIfNeeded: turn not active, skipping", {
            gameId,
            turnStatus: currentTurn.status,
          });
          return;
        }

        const allPlayers = gameState.data.teams.flatMap((team) => team.players);
        const aiPlayers = allPlayers.filter((p) => p.isAi);

        logger.debug("checkAndActIfNeeded: found AI players", {
          gameId,
          aiPlayerCount: aiPlayers.length,
          aiPlayers: aiPlayers.map((p) => ({
            publicId: p.publicId,
            role: p.role,
            teamName: p.teamName,
          })),
        });

        if (!currentTurn.clue) {
          // Need a clue - check for AI codemaster
          const teamName = currentTurn.teamName;
          const aiCodemaster = allPlayers.find(
            (p) => p.teamName === teamName && p.isAi && p.role === "CODEMASTER",
          );

          if (aiCodemaster) {
            logger.info("checkAndActIfNeeded: AI CODEMASTER should act", {
              gameId,
              playerId: aiCodemaster.publicId,
              teamName,
            });

            const context: AIDecisionContext = {
              gameId,
              playerId: aiCodemaster.publicId,
              playerInternalId: aiCodemaster._id,
              userId: aiCodemaster._userId,
              role: "CODEMASTER",
              roundNumber: currentRound.number,
              teamId: aiCodemaster._teamId,
              teamName: aiCodemaster.teamName,
            };

            await aiGiveClue(context);
            logger.debug("checkAndActIfNeeded: aiGiveClue completed", { gameId });
            return;
          } else {
            logger.debug("checkAndActIfNeeded: no AI codemaster for team", { gameId, teamName });
          }
        }

        if (currentTurn.clue && currentTurn.guessesRemaining > 0) {
          // Have a clue, need guesses - check for AI codebreakers
          const teamName = currentTurn.teamName;
          const teamCodebreakers = allPlayers.filter(
            (p) => p.teamName === teamName && p.role === "CODEBREAKER",
          );
          const allCodebreakersAreAI =
            teamCodebreakers.length > 0 && teamCodebreakers.every((p) => p.isAi);

          logger.debug("checkAndActIfNeeded: checking codebreakers", {
            gameId,
            teamName,
            codebreakerCount: teamCodebreakers.length,
            allCodebreakersAreAI,
          });

          if (allCodebreakersAreAI) {
            const aiCodebreaker = teamCodebreakers[0];

            logger.info("checkAndActIfNeeded: AI CODEBREAKER should act", {
              gameId,
              playerId: aiCodebreaker.publicId,
              teamName,
              clueWord: currentTurn.clue.word,
              clueNumber: currentTurn.clue.number,
              guessesRemaining: currentTurn.guessesRemaining,
            });

            const context: AIDecisionContext = {
              gameId,
              playerId: aiCodebreaker.publicId,
              playerInternalId: aiCodebreaker._id,
              userId: aiCodebreaker._userId,
              role: "CODEBREAKER",
              roundNumber: currentRound.number,
              teamId: aiCodebreaker._teamId,
              teamName: aiCodebreaker.teamName,
            };

            await aiMakeGuess(context);
            logger.debug("checkAndActIfNeeded: aiMakeGuess completed", { gameId });
            return;
          }
        }

        logger.debug("checkAndActIfNeeded: no AI action needed", { gameId });
      } catch (error) {
        logger.error("checkAndActIfNeeded failed", {
          gameId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    /**
     * AI gives a clue as CODEMASTER
     */
    const aiGiveClue = async (context: AIDecisionContext): Promise<void> => {
      const decisionKey = `clue:${context.gameId}:${context.playerId}`;

      if (activeDecisions.has(decisionKey)) {
        logger.debug("aiGiveClue: already running, skipping", { decisionKey });
        return;
      }

      activeDecisions.add(decisionKey);
      logger.info("aiGiveClue: STARTING spymaster pipeline", {
        gameId: context.gameId,
        playerId: context.playerId,
        teamName: context.teamName,
        roundNumber: context.roundNumber,
      });

      const game = await findGameByPublicId(context.gameId);
      if (!game) {
        logger.warn("aiGiveClue: game not found", { gameId: context.gameId });
        activeDecisions.delete(decisionKey);
        return;
      }

      // Create pipeline run
      let run;
      try {
        run = await createPipelineRun({
          gameId: game._id,
          playerId: context.playerInternalId,
          pipelineType: PIPELINE_TYPE.SPYMASTER,
        });
        logger.debug("aiGiveClue: pipeline run created", { runId: run.id });
        GameEventsEmitter.aiPipelineStarted(context.gameId, run.id, PIPELINE_TYPE.SPYMASTER);
      } catch (error) {
        logger.error("aiGiveClue: pipeline run creation failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        activeDecisions.delete(decisionKey);
        return;
      }

      try {
        await emitNarration(context, "Analyzing the board and thinking of a clever clue...");

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

        logger.debug("aiGiveClue: calling LLM spymaster pipeline", {
          gameId: context.gameId,
          friendlyWordCount: friendlyWords.length,
          opponentWordCount: opponentWords.length,
          neutralWordCount: neutralWords.length,
          assassinWord,
          previousClueCount: previousClues.length,
        });

        const pipelineResult = await pipeline.runSpymasterPipeline({
          currentTeam: myTeam,
          friendlyWords,
          opponentWords,
          neutralWords,
          assassinWord,
          previousClues,
          onPromptGenerated: async (prompt) => {
            await appendPrompt(run.id, prompt);
          },
        });

        logger.info("aiGiveClue: LLM returned clue", {
          gameId: context.gameId,
          clue: pipelineResult.clue,
          number: pipelineResult.number,
          explanation: pipelineResult.explanation,
        });
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
          `I've got it! The clue is "${pipelineResult.clue}" for ${pipelineResult.number}`,
        );

        const decision = {
          word: pipelineResult.clue,
          count: pipelineResult.number,
        };

        const clueResult = await giveClue({
          gameId: context.gameId,
          roundNumber: context.roundNumber,
          userId: context.userId,
          playerId: context.playerId,
          word: decision.word,
          targetCardCount: decision.count,
        });

        if (clueResult.success) {
          // Add chat message when clue is given
          await emitNarration(
            context,
            `Giving clue: "${decision.word}" for ${decision.count} card(s). ${pipelineResult.explanation}`,
          );
        }

        if (!clueResult.success) {
          throw new Error(`Failed to give clue: ${JSON.stringify(clueResult.error)}`);
        }

        // Mark complete
        await updatePipelineStatus(run.id, PIPELINE_STATUS.COMPLETE);
        GameEventsEmitter.aiPipelineComplete(context.gameId, run.id);

        // Add completion message
        emitNarration(context, `Clue given successfully. Let's see what the team does!`);

        // After 20 seconds, show "waiting for prompt" message
        setTimeout(() => {
          emitNarration(context, `Waiting for the next prompt...`);
        }, 20000);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;

        logger.error("aiGiveClue failed", {
          error: errorMsg,
          stack: errorStack,
          context,
        });

        await updatePipelineStatus(run.id, PIPELINE_STATUS.FAILED, errorMsg);
        GameEventsEmitter.aiPipelineFailed(context.gameId, run.id, errorMsg);

        await emitNarration(context, "Oops! Something went wrong while thinking of a clue.");
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
        logger.debug("aiMakeGuess: already running, skipping", { decisionKey });
        return;
      }

      activeDecisions.add(decisionKey);
      logger.info("aiMakeGuess: STARTING guesser pipeline", {
        gameId: context.gameId,
        playerId: context.playerId,
        teamName: context.teamName,
        roundNumber: context.roundNumber,
      });

      // Get internal game ID for DB operations
      const game = await findGameByPublicId(context.gameId);
      if (!game) {
        activeDecisions.delete(decisionKey);
        return;
      }

      // Create pipeline run
      let run;
      try {
        logger.debug("checkAndActIfNeeded: About to create pipeline run", {
          gameId: game._id,
          playerId: context.userId,
          pipelineType: PIPELINE_TYPE.GUESSER,
        });

        run = await createPipelineRun({
          gameId: game._id,
          playerId: context.playerInternalId,
          pipelineType: PIPELINE_TYPE.GUESSER,
        });

        GameEventsEmitter.aiPipelineStarted(context.gameId, run.id, PIPELINE_TYPE.GUESSER);
      } catch (error) {
        activeDecisions.delete(decisionKey);
        return;
      }

      try {
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
          `Looking at the clue "${currentTurn.clue.word}"... filtering through ${remainingWords.length} words...`,
        );
        GameEventsEmitter.aiPipelineStage(context.gameId, run.id, "prefilter");

        const operativeDecision = await pipeline.runOperativePipeline({
          currentTeam: myTeam,
          remainingWords,
          clueWord: currentTurn.clue.word,
          clueNumber: currentTurn.clue.number,
          onWordEvaluated: async (result: PreFilterOutput) => {
            // Emit message for ALL evaluations (including "no link")
            emitNarration(
              context,
              `"${result.word}": ${result.link_confidence} connection. ${result.reason}`,
            );
          },
          onPrefilterComplete: async (results) => {
            // Log words with moderate or strong associations
            const moderateWords = results.filter((r) => r.link_confidence === "moderately");
            const strongWords = results.filter((r) => r.link_confidence === "extremely");

            if (moderateWords.length > 0 || strongWords.length > 0) {
              const wordsList = [
                ...strongWords.map((r) => `${r.word} (strong)`),
                ...moderateWords.map((r) => `${r.word} (moderate)`),
              ];
              // Fire and forget
              emitNarration(
                context,
                `Found ${wordsList.length} promising words: ${wordsList.join(", ")}`,
              );
            }
          },
          onPromptGenerated: async (prompt: string) => {
            await appendPrompt(run.id, prompt);
          },
        });

        if (operativeDecision.action === "stop") {
          await emitNarration(context, "Hmm, none of these words feel right. I'll pass.");

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

          // Log outcome and waiting message
          emitNarration(context, `Turn ended. Playing it safe this round.`);
          setTimeout(() => {
            emitNarration(context, `Waiting for the next prompt...`);
          }, 20000);

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
          `Found ${rankedList.length} good candidates! Ranking them now...`,
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

        const maxGuesses = Math.min(clueNumber, rankedList.length);
        await emitNarration(context, `Ready to make up to ${maxGuesses} guess(es). Let's go!`);

        let correctGuesses = 0;

        for (let i = 0; i < Math.min(clueNumber, rankedList.length); i++) {
          const candidate = rankedList[i];

          // Announce the next guess
          await emitNarration(context, `Closest association is "${candidate.word}"`);

          // Wait 5 seconds before making the guess
          await delay(5000);

          // Add chat message for moderate+ confidence (score >= 0.6)
          if (candidate.score >= 0.6) {
            await emitNarration(
              context,
              `Choosing "${candidate.word}" with ${(candidate.score * 100).toFixed(0)}% confidence. ${candidate.reason}`,
            );
          }

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

          if (outcome === "CORRECT_TEAM_CARD") {
            correctGuesses++;

            if (correctGuesses >= clueNumber) {
              const endTurnResult = await endTurn({
                gameId: context.gameId,
                roundNumber: context.roundNumber,
                userId: context.userId,
                playerId: context.playerId,
              });

              if (!endTurnResult.success) {
                throw new Error(`Failed to end turn: ${endTurnResult.error}`);
              }

              // Log successful completion
              emitNarration(context, `Perfect! Found all ${correctGuesses} cards. Ending my turn.`);
              break;
            }
          } else {
            // Log the outcome
            emitNarration(
              context,
              `Wrong card! That was a ${outcome.toLowerCase().replace(/_/g, " ")}. My turn is over.`,
            );
            break;
          }
        }

        // Mark complete
        await updatePipelineStatus(run.id, PIPELINE_STATUS.COMPLETE);
        GameEventsEmitter.aiPipelineComplete(context.gameId, run.id);

        // Add completion message
        emitNarration(context, `Move complete. Analyzing the result...`);

        // After 20 seconds, show "waiting for prompt" message
        setTimeout(() => {
          emitNarration(context, `Waiting for the next prompt...`);
        }, 20000);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";

        await updatePipelineStatus(run.id, PIPELINE_STATUS.FAILED, errorMsg);
        GameEventsEmitter.aiPipelineFailed(context.gameId, run.id, errorMsg);

        await emitNarration(context, "Oops! Something went wrong while making guesses.");
      } finally {
        activeDecisions.delete(decisionKey);
      }
    };

    /**
     * Initialize event listeners
     * NOTE: Disabled for now - AI is only triggered manually via trigger endpoint
     */
    const initialize = () => {
      // Event listeners disabled - manual triggering only
    };

    return {
      initialize,
      checkAndActIfNeeded, // Expose for manual triggering
    };
  };

export type AIPlayerService = ReturnType<ReturnType<typeof createAIPlayerService>>;
