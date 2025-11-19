/**
 * GUESSER PRE-FILTER (Stage 1)
 *
 * Evaluates individual words for confidence level.
 * Filters out words with "no link" to the clue.
 */

import type { LocalLLMService } from "./local-llm.service";

/**
 * Pre-filter Input/Output
 */
export type PreFilterInput = {
  clueWord: string;
  word: string; // Single word to evaluate
};

export type PreFilterOutput = {
  word: string;
  link_confidence: "extremely" | "moderately" | "no link";
  reason: string;
};

/**
 * Build the pre-filter prompt for a single word
 */
export const buildPreFilterPrompt = (input: PreFilterInput): string => {
  const { clueWord, word } = input;

  return `You are a Guesser-Assistant working in a game of Codenames.

Your job: Decide how confidently the word "${word}" is connected to the clue "${clueWord}" for your team.

You must answer **only** in this JSON format:

\`\`\`json
{
  "word": "${word}",
  "link_confidence": "<'extremely' | 'moderately' | 'no link'>",
  "reason": "<short explanation>"
}
\`\`\`

Rules:
• You may use metaphors and indirect associations if relevant to gameplay.
• Avoid extremely obscure meanings, rare slang, or associations with a high risk of pointing to opponent, neutral, or assassin words.
• If you judge there is essentially no meaningful link, choose "link_confidence": "no link".
• If you judge the link is strong and direct, choose "link_confidence": "extremely".
• If you judge the link is plausible but less certain, choose "link_confidence": "moderately".
• Do not output any numeric score — only the categorical field.
• Output only the JSON object — no extra text, commentary or lists.

Examples:

HIGH confidence ("extremely"):
• BABY → CRADLE (very clear, direct link)
• SPACE → ROCKET (iconic space-travel link)
• MUSIC → GUITAR (core instrument)
• OCEAN → WAVES (defining ocean feature)
• FOREST → TREES (trees = forest)

MODERATE confidence ("moderately"):
• BABY → SLEEP (babies sleep, but many things sleep)
• SPACE → ROOM (a "space" could be a room)
• MUSIC → SOUND (music produces sound, general connection)
• OCEAN → BODY (ocean is a "body" of water, broader)
• FOREST → SHADOW (forest has shadows, weaker link)

Now evaluate: Does "${word}" connect to "${clueWord}"?`;
};

/**
 * Run pre-filter for all remaining words
 */
export const runPreFilter = async (
  llm: LocalLLMService,
  clueWord: string,
  remainingWords: string[],
): Promise<PreFilterOutput[]> => {
  console.log(`[Pre-Filter] Stage 1: Pre-filtering ${remainingWords.length} words...`);

  const results: PreFilterOutput[] = [];

  for (const word of remainingWords) {
    const prompt = buildPreFilterPrompt({ clueWord, word });

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await llm.generateJSON<PreFilterOutput>(prompt);

        // Validate output
        if (!result.word || !result.link_confidence || !result.reason) {
          console.warn(`[Pre-Filter] Invalid response for "${word}", retrying...`);
          continue;
        }

        // Valid pre-filter result
        results.push(result);
        console.log(`[Pre-Filter] ${word} -> ${result.link_confidence}`);
        break;
      } catch (error) {
        console.error(`[Pre-Filter] Error for "${word}":`, error);
        if (attempts >= maxAttempts) {
          // If we can't get a valid pre-filter after retries, assume "no link"
          results.push({
            word,
            link_confidence: "no link",
            reason: "Failed to evaluate",
          });
        }
      }
    }
  }

  // Filter candidates: keep "extremely" and "moderately" confident words
  const candidates = results.filter(
    (r) => r.link_confidence === "extremely" || r.link_confidence === "moderately"
  );

  console.log(`[Pre-Filter] Stage 1 complete: ${candidates.length} candidates passed`);

  return candidates;
};
