/**
 * SPYMASTER ROLE
 *
 * Generates clues for the team's words.
 */

import type { LocalLLMService } from "./local-llm.service";

/**
 * Spymaster Input/Output
 */
export type SpymasterInput = {
  currentTeam: string;
  friendlyWords: string[];
  opponentWords: string[];
  neutralWords: string[];
  assassinWord: string;
  previousClues: string[]; // All clues used this round (by both teams)
  onPromptGenerated?: (prompt: string) => void | Promise<void>;
};

export type SpymasterOutput = {
  clue: string;
  number: number;
  explanation: string;
};

/**
 * Build the spymaster prompt
 */
export const buildSpymasterPrompt = (input: SpymasterInput): string => {
  const { currentTeam, friendlyWords, opponentWords, neutralWords, assassinWord, previousClues } =
    input;

  // Format board with labels
  const boardLines: string[] = [];

  friendlyWords.forEach((w) => boardLines.push(`${w} (FRIENDLY)`));
  opponentWords.forEach((w) => boardLines.push(`${w} (OPPONENT)`));
  neutralWords.forEach((w) => boardLines.push(`${w} (NEUTRAL)`));
  boardLines.push(`${assassinWord} (ASSASSIN)`);

  const boardText = boardLines.join(", ");

  return `You are the **Spymaster** for a game of *Codenames*.
You are playing on the **${currentTeam.toUpperCase()}** team.
You will be given a board of 25 words, each labelled as one of: **FRIENDLY**, **OPPONENT**, **ASSASSIN**, **NEUTRAL**.
Your objective is to give a clue that helps your teammates guess your team's FRIENDLY words.

### Rules
- The clue must be a **single word** (not one of the 25 board words, nor a direct subset/superset of any board word).${
    previousClues.length > 0
      ? `\n- The clue must NOT be any of these previously used clues: ${previousClues.join(", ")}.`
      : ""
  }
- After the word, you must provide a number: how many FRIENDLY words the clue is intended to cover.
- Your clue should aim to cover **two or more** FRIENDLY words, if possible.
- You must avoid giving a clue that points to any OPPONENT or ASSASSIN word (or strongly hints at them).
- Format your answer as **JSON only**, exactly:
  \`\`\`json
  {
    "clue": "<single-word clue>",
    "number": <integer>,
    "explanation": "<brief human-style reasoning>"
  }
  \`\`\`

### **Example**

**BOARD:**
APPLE (FRIENDLY), MOON (OPPONENT), JUPITER (FRIENDLY), STONE (NEUTRAL), SATELLITE (FRIENDLY), HAMMER (OPPONENT), …

**TEAM:** RED

**OUTPUT:**
\`\`\`json
{
  "clue": "orbit",
  "number": 2,
  "explanation": "JUPITER and SATELLITE both relate to orbiting; avoids HAMMER and MOON."
}
\`\`\`

---

### **Now here is the board state:**

**BOARD:**
${boardText}

**TEAM:** ${currentTeam.toUpperCase()}

Please provide your clue now in JSON format only.`;
};

/**
 * Run the spymaster pipeline
 */
export const runSpymasterPipeline = async (
  llm: LocalLLMService,
  input: SpymasterInput,
): Promise<SpymasterOutput> => {
  const prompt = buildSpymasterPrompt(input);

  // Log the prompt if callback provided
  if (input.onPromptGenerated) {
    await input.onPromptGenerated(prompt);
  }

  // Keep trying until we get valid output
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await llm.generateJSON<SpymasterOutput>(prompt);

      // Validate output
      if (!result.clue || typeof result.clue !== "string") {
        continue;
      }

      if (!result.number || typeof result.number !== "number" || result.number < 1) {
        continue;
      }

      // Check if clue is one of the board words
      const allBoardWords = [
        ...input.friendlyWords,
        ...input.opponentWords,
        ...input.neutralWords,
        input.assassinWord,
      ];

      const clueWordLower = result.clue.toLowerCase();
      if (allBoardWords.some((w) => w.toLowerCase() === clueWordLower)) {
        continue;
      }

      // Check if clue has already been used
      if (input.previousClues.some((c) => c.toLowerCase() === clueWordLower)) {
        continue;
      }

      return result;
    } catch (error) {
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error(`Failed to get valid spymaster clue after ${maxAttempts} attempts`);
};
