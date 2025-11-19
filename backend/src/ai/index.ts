/**
 * AI Module - Initializes AI-related services following the repository pattern
 */

import { createLocalLLMService } from "./llm/local-llm.service";
import { createAIPlayerService } from "./ai-player/ai-player.service";
import type { LocalLLMService } from "./llm/local-llm.service";
import type { AIPlayerService } from "./ai-player/ai-player.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { EndTurnService } from "@backend/gameplay/end-turn/end-turn.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";

// Export event bus
export { gameEventBus, emitServerGameEvent } from "./events/game-event-bus";
export { createCodenamesPipeline } from "./llm/codenames-pipeline";
export type { CodenamesPipeline } from "./llm/codenames-pipeline";
export type { LocalLLMService, AIPlayerService };

export type AIModuleDependencies = {
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
 * Initializes the AI feature module with all dependencies
 */
export const initialize = (dependencies: AIModuleDependencies) => {
  const { llmConfig, giveClue, makeGuess, endTurn, getGameState } = dependencies;

  const llm = createLocalLLMService(llmConfig);

  const aiPlayerService = createAIPlayerService({
    llm,
    giveClue,
    makeGuess,
    endTurn,
    getGameState,
  });

  aiPlayerService.initialize();

  return {
    aiPlayerService,
    llm,
  };
};
