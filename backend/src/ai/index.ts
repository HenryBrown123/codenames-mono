/**
 * AI Module - Initializes AI-related services following the repository pattern
 */

import type { Express } from "express";
import { Router } from "express";
import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import type { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";
import type { HttpLoggerHandler } from "@backend/common/http-middleware/http-logger.middleware";
import type { AppLogger } from "@backend/common/logging";
import { createLocalLLMService } from "./llm/local-llm.service";
import { createAIPlayerService } from "./ai-player/ai-player.service";
import type { LocalLLMService } from "./llm/local-llm.service";
import type { AIPlayerService } from "./ai-player/ai-player.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { EndTurnService } from "@backend/gameplay/end-turn/end-turn.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";
import {
  createRun,
  findRunningByGameId,
  updateRunStatus,
  updateSpymasterResponse,
  updatePrefilterResponse,
  updateRankerResponse,
  appendPrompt,
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import { createMessage } from "@backend/common/data-access/repositories/game-messages.repository";
import { findGameByPublicId } from "@backend/common/data-access/repositories/games.repository";
import aiMove from "./ai-move";

export { createCodenamesPipeline } from "./llm/codenames-pipeline";
export type { CodenamesPipeline } from "./llm/codenames-pipeline";
export type { LocalLLMService, AIPlayerService };

export type AIModuleDependencies = {
  app: Express;
  db: Kysely<DB>;
  auth: AuthMiddleware;
  httpLogger: HttpLoggerHandler;
  appLogger: AppLogger;
  llmConfig: {
    ollamaUrl: string;
    model: string;
    temperature: number;
  };
  giveClue: GiveClueService;
  makeGuess: MakeGuessService;
  endTurn: EndTurnService;
  getGameState: GameplayStateProvider;
};

/**
 * Initializes the AI feature module with all dependencies and registers routes
 */
export const initialize = (dependencies: AIModuleDependencies) => {
  const {
    app,
    db,
    auth,
    httpLogger,
    appLogger,
    llmConfig,
    giveClue,
    makeGuess,
    endTurn,
    getGameState,
  } = dependencies;

  const logger = appLogger.for({ feature: "ai" }).withMeta({ model: llmConfig.model }).create();
  const llm = createLocalLLMService(llmConfig);

  const aiPlayerService = createAIPlayerService(logger)({
    llm,
    giveClue,
    makeGuess,
    endTurn,
    getGameState,
    createPipelineRun: createRun(db),
    findRunningPipeline: findRunningByGameId(db),
    updatePipelineStatus: updateRunStatus(db),
    updateSpymasterResponse: updateSpymasterResponse(db),
    updatePrefilterResponse: updatePrefilterResponse(db),
    updateRankerResponse: updateRankerResponse(db),
    appendPrompt: appendPrompt(db),
    createGameMessage: createMessage(db),
    findGameByPublicId: findGameByPublicId(db),
  });

  aiPlayerService.initialize();

  const aiMoveFeature = aiMove(logger)({
    aiPlayerService,
    getGameState,
    db,
  });

  const router = Router();

  // HTTP request/response logging
  router.use(httpLogger(logger));

  router.post("/games/:gameId/ai/move", auth, aiMoveFeature.triggerMove.controller);
  router.get("/games/:gameId/ai/status", auth, aiMoveFeature.getStatus.controller);

  app.use("/api", router);

  logger.info("AI module initialized");

  return {
    aiPlayerService,
    llm,
  };
};
