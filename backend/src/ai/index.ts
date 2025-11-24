/**
 * AI Module - Initializes AI-related services following the repository pattern
 */

import type { Express } from "express";
import { Router } from "express";
import type { Kysely } from "kysely";
import type { DB } from "@backend/common/db/db.types";
import type { AuthMiddleware } from "@backend/common/http-middleware/auth.middleware";
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
} from "@backend/common/data-access/repositories/ai-pipeline-runs.repository";
import { createMessage } from "@backend/common/data-access/repositories/game-messages.repository";
import { findGameByPublicId } from "@backend/common/data-access/repositories/games.repository";
import aiMove from "./ai-move";

export { gameEventBus, emitServerGameEvent } from "./events/game-event-bus";
export { createCodenamesPipeline } from "./llm/codenames-pipeline";
export type { CodenamesPipeline } from "./llm/codenames-pipeline";
export type { LocalLLMService, AIPlayerService };

export type AIModuleDependencies = {
  app: Express;
  db: Kysely<DB>;
  auth: AuthMiddleware;
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
  const { app, db, auth, llmConfig, giveClue, makeGuess, endTurn, getGameState } = dependencies;

  const llm = createLocalLLMService(llmConfig);

  const aiPlayerService = createAIPlayerService({
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
    createGameMessage: createMessage(db),
    findGameByPublicId: findGameByPublicId(db),
  });

  aiPlayerService.initialize();

  const aiMoveFeature = aiMove({
    aiPlayerService,
    getGameState,
    db,
  });

  const router = Router();
  router.post("/games/:gameId/ai/move", auth, aiMoveFeature.triggerMove.controller);
  router.get("/games/:gameId/ai/status", auth, aiMoveFeature.getStatus.controller);

  app.use("/api", router);

  return {
    aiPlayerService,
    llm,
  };
};
