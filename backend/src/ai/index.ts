/**
 * AI Module - Export all AI-related services
 */

export { createLocalLLMService } from "./llm/local-llm.service";
export type { LocalLLMService, LocalLLMConfig } from "./llm/local-llm.service";

export { createAIPlayerService } from "./ai-player/ai-player.service";
export type { AIPlayerService, AIPlayerDependencies } from "./ai-player/ai-player.service";

export { gameEventBus, emitServerGameEvent } from "./events/game-event-bus";

export {
  buildCodemasterPrompt,
  buildCodebreakerPrompt,
} from "./strategy/ai-prompts";
