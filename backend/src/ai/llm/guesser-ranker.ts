/**
 * GUESSER RANKER (Stage 2)
 *
 * Ranks filtered candidate words from the pre-filter stage.
 */

import type { LocalLLMService } from "./local-llm.service";
import type { PreFilterOutput } from "./guesser-prefilter";

/**
 * Ranking Input/Output
 */
export type RankingInput = {
  currentTeam: string;
  clueWord: string;
  clueNumber: number;
  candidates: PreFilterOutput[]; // Words that passed the pre-filter
};

export type RankedWord = {
  word: string;
  score: number; // 0.0 to 1.0
  reason: string;
};

export type RankingOutput = {
  ranked: RankedWord[];
};

/**
 * Build the ranking prompt
 */
export const buildRankingPrompt = (input: RankingInput): string => {
  const { currentTeam, clueWord, clueNumber, candidates } = input;

  const candidatesText = candidates
    .map((c) => `  - ${c.word}: ${c.link_confidence} (${c.reason})`)
    .join("\n");

  return `You are a Guesser-Assistant working for the ${currentTeam.toUpperCase()} team in a game of Codenames.

You will be given:
• A clue: "${clueWord}"
• A number: ${clueNumber}
• A list of candidate words (with their prior confidence levels and brief reasons) derived from the pre-filter step:

${candidatesText}

Your job:
Evaluate how strongly each candidate word connects to the clue in the broader context (board state, overlap, risk). Then produce a ranked list of all candidate words sorted from strongest to weakest.

Output Format

Your final answer must be a single JSON object:

\`\`\`json
{
  "ranked": [
    {
      "word": "WORD1",
      "score": 0.8,
      "reason": "Short explanation of the connection"
    },
    {
      "word": "WORD2",
      "score": 0.6,
      "reason": "Short explanation of the connection"
    }
    // … include every candidate word exactly once
  ]
}
\`\`\`

• The list must include every word from the candidate list exactly once.
• Items must be sorted from highest score to lowest.
• Score should be between 0.0 and 1.0
• Do not include any extra text outside the JSON object.

Use the clue and the candidate words (with their prior confidence & reasons) to produce the ranked JSON described above.`;
};

/**
 * Run ranking on pre-filtered candidates
 */
export const runRanking = async (
  llm: LocalLLMService,
  input: RankingInput,
  onPromptGenerated?: (prompt: string) => void | Promise<void>,
): Promise<RankedWord[]> => {
  const prompt = buildRankingPrompt(input);

  // Log the prompt if callback provided
  if (onPromptGenerated) {
    await onPromptGenerated(prompt);
  }

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await llm.generateJSON<RankingOutput>(prompt);

      // Validate ranked array
      if (!result.ranked || !Array.isArray(result.ranked) || result.ranked.length === 0) {
        continue;
      }

      // Sort by score descending
      result.ranked.sort((a, b) => b.score - a.score);

      return result.ranked;
    } catch (error) {
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error(`Failed to rank candidates after ${maxAttempts} attempts`);
};
