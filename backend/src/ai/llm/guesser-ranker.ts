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
): Promise<RankedWord[]> => {
  console.log(`[Ranker] Stage 2: Ranking ${input.candidates.length} candidates...`);

  const prompt = buildRankingPrompt(input);

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await llm.generateJSON<RankingOutput>(prompt);

      console.log(`[Ranker] LLM Response:`, JSON.stringify(result, null, 2));

      // Validate ranked array
      if (!result.ranked || !Array.isArray(result.ranked) || result.ranked.length === 0) {
        console.warn(`[Ranker] Attempt ${attempts}: Invalid ranking response, retrying...`);
        continue;
      }

      // Sort by score descending
      result.ranked.sort((a, b) => b.score - a.score);

      console.log(`[Ranker] Stage 2 complete: ${result.ranked.length} words ranked`);
      console.log(`[Ranker] All ranked candidates:`);
      result.ranked.forEach((entry, idx) => {
        console.log(`  ${idx + 1}. ${entry.word} (${entry.score.toFixed(2)}): ${entry.reason}`);
      });

      return result.ranked;
    } catch (error) {
      console.error(`[Ranker] Attempt ${attempts} error:`, error);
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error(`Failed to rank candidates after ${maxAttempts} attempts`);
};
