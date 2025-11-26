/**
 * CODENAMES AI PIPELINE
 *
 * Orchestrates the spymaster and guesser roles using a two-stage approach:
 * - Spymaster: Generates clues for team words
 * - Guesser Stage 1: Pre-filters words by confidence level
 * - Guesser Stage 2: Ranks filtered candidates
 */

import type { LocalLLMService } from "./local-llm.service";
import { runSpymasterPipeline, type SpymasterInput, type SpymasterOutput } from "./spymaster";
import { runPreFilter } from "./guesser-prefilter";
import { runRanking, type RankingInput } from "./guesser-ranker";

/**
 * Re-export types for external use
 */
export type { SpymasterInput, SpymasterOutput } from "./spymaster";
export type { PreFilterInput, PreFilterOutput } from "./guesser-prefilter";
export type { RankingInput, RankedWord, RankingOutput } from "./guesser-ranker";

/**
 * Guesser Input (for the complete two-stage pipeline)
 */
export type GuesserInput = {
  currentTeam: string;
  remainingWords: string[];
  clueWord: string;
  clueNumber: number;
  onPrefilterComplete?: (results: import("./guesser-prefilter").PreFilterOutput[]) => void | Promise<void>;
  onWordEvaluated?: (result: import("./guesser-prefilter").PreFilterOutput) => void | Promise<void>;
  onPromptGenerated?: (prompt: string) => void | Promise<void>;
};

/**
 * Guesser Output (final decision)
 */
export type GuesserDecision = {
  action: "guess" | "stop";
  word?: string;
  confidence: number;
  reason: string;
  rankedList?: Array<{ word: string; score: number; reason: string }>; // Full ranked list
};

/**
 * Create the complete Codenames AI pipeline
 */
export const createCodenamesPipeline = (llm: LocalLLMService) => {
  /**
   * Run the spymaster pipeline
   */
  const runSpymaster = async (input: SpymasterInput): Promise<SpymasterOutput> => {
    return runSpymasterPipeline(llm, input);
  };

  /**
   * Run the complete two-stage guesser pipeline
   */
  const runGuesser = async (input: GuesserInput): Promise<GuesserDecision> => {
    if (input.remainingWords.length === 0) {
      return {
        action: "stop",
        confidence: 1,
        reason: "No words remaining",
      };
    }

    // STAGE 1: Pre-filter all remaining words
    const candidates = await runPreFilter(
      llm,
      input.clueWord,
      input.remainingWords,
      input.onPrefilterComplete,
      input.onWordEvaluated,
      input.onPromptGenerated,
    );

    if (candidates.length === 0) {
      return {
        action: "stop",
        confidence: 0,
        reason: "No words passed pre-filter",
      };
    }

    // STAGE 2: Rank the filtered candidates
    const ranked = await runRanking(
      llm,
      {
        currentTeam: input.currentTeam,
        clueWord: input.clueWord,
        clueNumber: input.clueNumber,
        candidates,
      },
      input.onPromptGenerated,
    );

    const topChoice = ranked[0];

    return {
      action: "guess",
      word: topChoice.word,
      confidence: topChoice.score,
      reason: topChoice.reason,
      rankedList: ranked, // Include full ranked list
    };
  };

  return {
    runSpymasterPipeline: runSpymaster,
    runOperativePipeline: runGuesser,
  };
};

export type CodenamesPipeline = ReturnType<typeof createCodenamesPipeline>;
