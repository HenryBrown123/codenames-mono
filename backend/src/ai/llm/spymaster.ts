/**
 * SPYMASTER ROLE
 *
 * Generates clues for the team's words using few-shot examples.
 * The prompt is deliberately short — small models perform better
 * with examples than with long rule lists. Rule enforcement
 * (board word check, word-form check) is handled in code.
 */

import type { LocalLLMService } from "./local-llm.service";

export type SpymasterInput = {
  currentTeam: string;
  friendlyWords: string[];
  opponentWords: string[];
  neutralWords: string[];
  assassinWord: string;
  previousClues: string[];
  onPromptGenerated?: (prompt: string) => void | Promise<void>;
};

export type SpymasterOutput = {
  clue: string;
  number: number;
  explanation: string;
};

/**
 * Build the spymaster prompt.
 *
 * Design principles:
 * - Two few-shot examples teach the format AND the strategy
 * - Board state is compact (categorised, not labelled per-word)
 * - Only 2 rules stated: single word, not a board word
 * - Everything else is enforced in code
 */
export const buildSpymasterPrompt = (input: SpymasterInput): string => {
  const { friendlyWords, opponentWords, neutralWords, assassinWord, previousClues } =
    input;

  const previousClueNote =
    previousClues.length > 0
      ? `\nAlready used clues (do not reuse): ${previousClues.join(", ")}`
      : "";

  return `Codenames Spymaster. Give a one-word clue connecting AS MANY of your team's words as possible. Connecting 3+ words is great, 2 is good, 1 is a last resort. Avoid opponent/assassin words. Your clue must NOT be any word on the board.

Example 1:
Team words: APPLE, PIE, CHERRY
Opponent: ROCKET, MOON | Assassin: BOMB
Answer: {"clue":"baking","number":3}

Example 2:
Team words: JUPITER, SATELLITE, NET, STAR
Opponent: APPLE, CHAIR | Assassin: KNIFE
Answer: {"clue":"space","number":3}

Now your turn.
Team words: ${friendlyWords.join(", ")}
Opponent: ${opponentWords.join(", ")} | Assassin: ${assassinWord}
Neutral: ${neutralWords.join(", ")}${previousClueNote}

Answer:`;
};

/**
 * Check if a clue is a direct word-form of any board word.
 * Catches plurals/conjugations (star→stars, break→breaking) but NOT
 * arbitrary substrings (art does NOT block "party").
 */
const isWordFormOf = (clue: string, boardWords: string[]): boolean => {
  const clueLower = clue.toLowerCase();
  return boardWords.some((w) => {
    const wLower = w.toLowerCase();
    if (clueLower === wLower) return true;

    const longer = clueLower.length >= wLower.length ? clueLower : wLower;
    const shorter = clueLower.length >= wLower.length ? wLower : clueLower;
    const lengthDiff = longer.length - shorter.length;

    return lengthDiff > 0 && lengthDiff <= 3 && longer.startsWith(shorter);
  });
};

/**
 * Run the spymaster pipeline
 */
export const runSpymasterPipeline = async (
  llm: LocalLLMService,
  input: SpymasterInput,
): Promise<SpymasterOutput> => {
  const prompt = buildSpymasterPrompt(input);

  if (input.onPromptGenerated) {
    await input.onPromptGenerated(prompt);
  }

  let attempts = 0;
  const maxAttempts = 8;

  const allBoardWords = [
    ...input.friendlyWords,
    ...input.opponentWords,
    ...input.neutralWords,
    input.assassinWord,
  ];

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await llm.generateJSON<SpymasterOutput>(prompt, {
        temperature: 0.7,
        top_k: 50,
      });

      if (!result.clue || typeof result.clue !== "string") {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- invalid structure");
        continue;
      }

      if (!result.number || typeof result.number !== "number" || result.number < 1) {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- invalid number");
        continue;
      }

      const clueWordLower = result.clue.toLowerCase().trim();

      if (clueWordLower.includes(" ")) {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- multi-word:", result.clue);
        continue;
      }

      if (allBoardWords.some((w) => w.toLowerCase() === clueWordLower)) {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- is board word:", result.clue);
        continue;
      }

      if (isWordFormOf(clueWordLower, allBoardWords)) {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- word-form of board word:", result.clue);
        continue;
      }

      if (input.previousClues.some((c) => c.toLowerCase() === clueWordLower)) {
        console.log("[AI-DEBUG] Spymaster attempt", attempts, "- previously used:", result.clue);
        continue;
      }

      console.log("[AI-DEBUG] Spymaster accepted:", result.clue, "for", result.number, "(attempt", attempts + ")");

      return {
        clue: result.clue.trim(),
        number: result.number,
        explanation: result.explanation || "",
      };
    } catch (error) {
      console.log("[AI-DEBUG] Spymaster attempt", attempts, "- parse error");
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error(`Failed to get valid spymaster clue after ${maxAttempts} attempts`);
};
