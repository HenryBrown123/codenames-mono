/**
 * AI Module - Initializes AI-related services following the repository pattern
 */

// Service imports
import { createLocalLLMService } from "./llm/local-llm.service";
import { createAIPlayerService } from "./ai-player/ai-player.service";
import type { LocalLLMService } from "./llm/local-llm.service";
import type { AIPlayerService } from "./ai-player/ai-player.service";
import type { GiveClueService } from "@backend/gameplay/give-clue/give-clue.service";
import type { MakeGuessService } from "@backend/gameplay/make-guess/make-guess.service";
import type { GameplayStateProvider } from "@backend/common/state/gameplay-state.provider";

// Export event bus
export { gameEventBus, emitServerGameEvent } from "./events/game-event-bus";

// Export prompts
export {
  buildCodemasterPrompt,
  buildCodebreakerPrompt,
} from "./strategy/ai-prompts";

// Export types
export type { LocalLLMService, AIPlayerService };

export type AIModuleDependencies = {
  llmConfig: {
    ollamaUrl: string;
    model: string;
    temperature: number;
  };
  giveClue: GiveClueService;
  makeGuess: MakeGuessService;
  getGameState: GameplayStateProvider;
};

/**
 * Initializes the AI feature module with all dependencies
 */
export const initialize = (dependencies: AIModuleDependencies) => {
  const { llmConfig, giveClue, makeGuess, getGameState } = dependencies;

  // Create LLM service
  const llm = createLocalLLMService(llmConfig);

  // Create AI player service - simple, just uses game state provider
  const aiPlayerService = createAIPlayerService({
    llm,
    giveClue,
    makeGuess,
    getGameState,
  });

  // Initialize event listeners
  aiPlayerService.initialize();

  return {
    aiPlayerService,
    llm,
  };
};
