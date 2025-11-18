/**
 * CODENAMES AI LLM PIPELINE
 *
 * Simple, single-call approach for both spymaster and guesser.
 */

import type { LocalLLMService } from "./local-llm.service";

/**
 * TYPE DEFINITIONS
 */

// Spymaster Input/Output (single LLM call)
export type SpymasterInput = {
  currentTeam: string;
  friendlyWords: string[];
  opponentWords: string[];
  neutralWords: string[];
  assassinWord: string;
  previousClues: string[]; // All clues used this round (by both teams)
};

export type SpymasterOutput = {
  clue: string;
  number: number;
  explanation: string;
};

// Guesser Input/Output (single LLM call, returns just one word)
export type GuesserInput = {
  currentTeam: string;
  remainingWords: string[];
  clueWord: string;
  clueNumber: number;
};

export type RankedWord = {
  word: string;
  score: number; // 0.0 to 1.0: how strongly this word connects to the clue
  reason: string; // Explanation of the connection (or lack thereof)
};

export type GuesserOutput = {
  ranked: RankedWord[]; // All remaining words ranked by score (highest to lowest)
};

/**
 * SPYMASTER PROMPT
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

### ⚠️ CRITICAL RULES - READ CAREFULLY ⚠️

**RULE #1: YOUR CLUE CANNOT BE ANY WORD ON THE BOARD**

The following 25 words are ON THE BOARD and are **ABSOLUTELY FORBIDDEN** as clues:
${[...friendlyWords, ...opponentWords, ...neutralWords, assassinWord].join(", ")}

❌ DO NOT use any of these 25 words as your clue
❌ DO NOT use plurals, past tense, or variations of these words
❌ Your clue must be a COMPLETELY DIFFERENT word

**RULE #1b: YOUR CLUE CANNOT BE A PREVIOUSLY USED CLUE**

${
  previousClues.length > 0
    ? `The following clues have ALREADY been used this round and are **ABSOLUTELY FORBIDDEN**:
${previousClues.join(", ")}

❌ DO NOT use any of these ${previousClues.length} clues again
❌ You must think of a NEW clue that hasn't been used yet`
    : "No clues have been used yet - you can use any valid clue."
}

**RULE #2: Format**
- The clue must be a **single word** (no spaces, no hyphens)
- After the word, provide a number: how many FRIENDLY words the clue covers
- Your clue should aim to cover **two or more** FRIENDLY words if possible

**RULE #3: Safety**
- NEVER give a clue that hints at the ASSASSIN word: **${assassinWord}**
- Avoid clues that strongly point to OPPONENT words
- Prioritize safety over clever high-number clues

**RULE #4: Output Format**
Format your answer as **JSON only**, exactly:

\`\`\`json
{
  "clue": "<single-word clue>",
  "number": <integer>,
  "explanation": "<brief human-style reasoning>"
}
\`\`\`

### **Example**

**BOARD WORDS:**
APPLE (FRIENDLY), MOON (OPPONENT), JUPITER (FRIENDLY), STONE (NEUTRAL), SATELLITE (FRIENDLY), HAMMER (OPPONENT), etc.

**FORBIDDEN CLUES:** Apple, Moon, Jupiter, Stone, Satellite, Hammer, etc.

**GOOD CLUE:**
\`\`\`json
{
  "clue": "orbit",
  "number": 2,
  "explanation": "JUPITER and SATELLITE both relate to orbiting. 'Orbit' is NOT on the board."
}
\`\`\`

**BAD CLUE:**
\`\`\`json
{
  "clue": "Jupiter",
  "number": 2,
  "explanation": "..."
}
\`\`\`
❌ WRONG - "Jupiter" IS on the board!

---

### **Now here is your game:**

**ALL 25 BOARD WORDS (DO NOT USE ANY OF THESE AS YOUR CLUE):**
${[...friendlyWords, ...opponentWords, ...neutralWords, assassinWord].join(", ")}

**TEAM:** ${currentTeam.toUpperCase()}

**FRIENDLY WORDS (yours to hint at):**
${friendlyWords.join(", ")}

**OPPONENT WORDS (avoid hinting at these):**
${opponentWords.join(", ")}

**NEUTRAL WORDS (avoid hinting at these):**
${neutralWords.join(", ")}

**ASSASSIN WORD (NEVER EVER hint at this):**
${assassinWord}

Remember: Make sure the chosen word is not in the word list.

Please provide your clue now in JSON format only.`;
};

/**
 * GUESSER PROMPT
 * Based on prompt.txt - ranked scoring system
 */
export const buildGuesserPrompt = (input: GuesserInput): string => {
  const { currentTeam, remainingWords, clueWord, clueNumber } = input;

  return `You are the Guesser in a game of Codenames.
You are playing on the ${currentTeam.toUpperCase()} team.
You will be given:
- A list of REMAINING WORDS on the board (your possible guesses).
- A clue from your Spymaster: a single word and a number.

Your job is to evaluate how strongly each remaining word is connected to the clue and to rank them.

Rules:
- Consider only **strong, direct, common-sense associations** between the clue and each word.
- Do **not** invent metaphorical, symbolic, or far-fetched connections.
- If a word has no clear link to the clue, give it a very low score (for example between 0.0 and 0.2) and explicitly say that there is no meaningful connection.
- You must assign a score to **every** remaining word.
- Scores must be between 0.0 (no meaningful connection) and 1.0 (very strong, obvious connection).
- Higher scores should represent clearly better guesses than lower scores.
- Every word in your output **must** be one of the remaining words, and each remaining word must appear exactly once.
- Sort the words from highest score to lowest score.

Output format:
Return **only** a single JSON object in the following format, with no additional text, commentary, or Markdown:

{
  "ranked": [
    {
      "word": "WORD1",
      "score": 0.9,
      "reason": "Short explanation of why this word is strongly connected to the clue."
    },
    {
      "word": "WORD2",
      "score": 0.5,
      "reason": "Short explanation of a weaker or partial connection."
    }
    // ... include all remaining words, in descending score order
  ]
}

Additional guidance:
- Focus first on identifying the **few best candidates** that most strongly match the clue.
- Then compare all other words against those best candidates and assign lower scores accordingly.
- If two words feel equally strong, you may give them the same or very similar scores.
- Do not try to force a connection for every word; it is better to give a low score and say there is no meaningful connection than to invent a bad association.

At inference time, the system will pick the top-ranked word (the one with the highest score in \`ranked[0]\`) as your final guess.

---

**TEAM:** ${currentTeam.toUpperCase()}

**REMAINING WORDS:**
${remainingWords.join(", ")}

**CLUE:** ${clueWord}

**NUMBER:** ${clueNumber}

Use the clue and the remaining words to fill in the JSON object described above.`;
};

/**
 * PIPELINE CREATION
 */
export const createCodenamesPipeline = (llm: LocalLLMService) => {
  /**
   * Run spymaster to get a clue
   */
  const runSpymasterPipeline = async (input: SpymasterInput): Promise<SpymasterOutput> => {
    console.log(`[Pipeline Spymaster] Generating clue for ${input.currentTeam} team`);
    console.log(`[Pipeline Spymaster] ${input.friendlyWords.length} friendly words remaining`);

    const prompt = buildSpymasterPrompt(input);

    // Keep trying until we get valid output
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await llm.generateJSON<SpymasterOutput>(prompt);

        console.log(`[Pipeline Spymaster] LLM Response:`, JSON.stringify(result, null, 2));

        // Validate output
        if (!result.clue || typeof result.clue !== "string") {
          console.warn(
            `[Pipeline Spymaster] Attempt ${attempts}: Invalid clue format, retrying...`,
          );
          continue;
        }

        if (!result.number || typeof result.number !== "number" || result.number < 1) {
          console.warn(
            `[Pipeline Spymaster] Attempt ${attempts}: Invalid number format, retrying...`,
          );
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
          console.warn(
            `[Pipeline Spymaster] Attempt ${attempts}: Clue "${result.clue}" is on the board, retrying...`,
          );
          continue;
        }

        // Check if clue has already been used
        if (input.previousClues.some((c) => c.toLowerCase() === clueWordLower)) {
          console.warn(
            `[Pipeline Spymaster] Attempt ${attempts}: Clue "${result.clue}" has already been used, retrying...`,
          );
          continue;
        }

        console.log(`[Pipeline Spymaster] Success: "${result.clue}" for ${result.number}`);
        return result;
      } catch (error) {
        console.error(`[Pipeline Spymaster] Attempt ${attempts} error:`, error);
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error(`Failed to get valid spymaster clue after ${maxAttempts} attempts`);
  };

  /**
   * Run guesser to pick one word
   */
  const runOperativePipeline = async (
    input: GuesserInput,
  ): Promise<{ action: "guess" | "stop"; word?: string; confidence: number; reason: string }> => {
    console.log(
      `[Pipeline Guesser] Picking word for clue "${input.clueWord}" (${input.clueNumber})`,
    );
    console.log(`[Pipeline Guesser] ${input.remainingWords.length} words remaining`);

    if (input.remainingWords.length === 0) {
      return {
        action: "stop",
        confidence: 1,
        reason: "No words remaining",
      };
    }

    const prompt = buildGuesserPrompt(input);

    // Keep trying until we get valid output
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await llm.generateJSON<GuesserOutput>(prompt);

        console.log(`[Pipeline Guesser] LLM Response:`, JSON.stringify(result, null, 2));

        // Validate: must have ranked array
        if (!result.ranked || !Array.isArray(result.ranked)) {
          console.warn(
            `[Pipeline Guesser] Attempt ${attempts}: Missing or invalid ranked array, retrying...`,
          );
          continue;
        }

        // Validate: ranked array should not be empty
        if (result.ranked.length === 0) {
          console.warn(
            `[Pipeline Guesser] Attempt ${attempts}: Ranked array is empty, retrying...`,
          );
          continue;
        }

        // Filter ranked entries to only include valid remaining words
        const validRanked = result.ranked.filter((entry) => {
          if (!entry.word || typeof entry.word !== "string") {
            console.warn(`[Pipeline Guesser] Skipping entry with invalid word: ${JSON.stringify(entry)}`);
            return false;
          }
          if (!input.remainingWords.includes(entry.word)) {
            console.warn(`[Pipeline Guesser] Skipping word not in remaining words: "${entry.word}"`);
            return false;
          }
          if (entry.word.toLowerCase() === input.clueWord.toLowerCase()) {
            console.warn(`[Pipeline Guesser] Skipping clue word: "${entry.word}"`);
            return false;
          }
          return true;
        });

        // Validate: after filtering, we should have at least one valid word
        if (validRanked.length === 0) {
          console.warn(
            `[Pipeline Guesser] Attempt ${attempts}: No valid words in ranked array, retrying...`,
          );
          continue;
        }

        // Sort by score descending (highest first)
        validRanked.sort((a, b) => b.score - a.score);

        // Pick the top-ranked word
        const topChoice = validRanked[0];

        console.log(`[Pipeline Guesser] Success: guessing "${topChoice.word}" (score: ${topChoice.score})`);
        console.log(`[Pipeline Guesser] Reason: ${topChoice.reason}`);
        console.log(`[Pipeline Guesser] All word rankings:`);
        validRanked.forEach((entry, idx) => {
          console.log(`  ${idx + 1}. ${entry.word} (${entry.score.toFixed(2)}): ${entry.reason}`);
        });

        return {
          action: "guess",
          word: topChoice.word,
          confidence: topChoice.score,
          reason: topChoice.reason,
        };
      } catch (error) {
        console.error(`[Pipeline Guesser] Attempt ${attempts} error:`, error);
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error(`Failed to get valid guess after ${maxAttempts} attempts`);
  };

  return {
    runSpymasterPipeline,
    runOperativePipeline,
  };
};

export type CodenamesPipeline = ReturnType<typeof createCodenamesPipeline>;
