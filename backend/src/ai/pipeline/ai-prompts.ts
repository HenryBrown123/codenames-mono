/**
 * Prompt templates for AI gameplay decisions
 */

export type CodemasterPromptInput = {
  myTeamCards: string[];
  opponentCards: string[];
  assassinCard: string;
  bystanderCards: string[];
  difficulty?: "easy" | "medium" | "hard";
};

export type CodebreakerPromptInput = {
  clueWord: string;
  clueCount: number;
  availableCards: string[];
  difficulty?: "easy" | "medium" | "hard";
  previousClues?: Array<{
    word: string;
    count: number;
    guesses: Array<{ cardWord: string; outcome: string }>;
  }>;
  guessesRemaining: number;
};

/**
 * Build prompt for CODEMASTER to give a clue
 */
export const buildCodemasterPrompt = (input: CodemasterPromptInput): string => {
  const { myTeamCards, opponentCards, assassinCard, bystanderCards, difficulty = "medium" } = input;

  const difficultyInstructions = {
    easy: "Give simple, obvious clues for 1-2 cards.",
    medium: "Give thoughtful clues for 2-3 cards, balancing risk and reward.",
    hard: "Give clever, multi-card clues for 3+ cards, taking calculated risks.",
  };

  // Create explicit "forbidden words" list
  const allBoardWords = [...myTeamCards, ...opponentCards, assassinCard, ...bystanderCards];

  return `You are the CODEMASTER in Codenames. Give a ONE-WORD clue for your team.

=== STEP 1: UNDERSTAND THE BOARD ===

YOUR TEAM'S CARDS (you want these guessed):
${myTeamCards.map((w, i) => `${i + 1}. ${w}`).join("\n")}

OPPONENT CARDS (avoid):
${opponentCards.join(", ")}

ASSASSIN (NEVER relate to this):
${assassinCard}

BYSTANDER CARDS (avoid):
${bystanderCards.join(", ")}

=== STEP 2: WORDS YOU CANNOT USE AS CLUES ===

Your clue word CANNOT be any of these words (they are on the board):
${allBoardWords.join(", ")}

=== STEP 3: FIND CONNECTIONS ===

Look at YOUR TEAM'S CARDS above. Which 2-3 cards share a common theme?

Examples of GOOD connections:
- "Lion", "Tiger", "Bear" → clue: "Animal" (they are all animals)
- "Red", "Blue", "Green" → clue: "Color" (they are all colors)
- "Ocean", "River", "Lake" → clue: "Water" (they all contain water)

Examples of BAD connections:
- "Ocean", "Potion" → clue: "Rhyme" (rhyming is not a real connection!)
- "Cat", "Catalog" → clue: "Similar" (sharing letters is not a connection!)

=== STEP 4: CHECK YOUR CLUE ===

Before responding, verify:
1. Is your clue word in the "CANNOT USE" list above? If YES, choose a different word!
2. Does it connect to the ASSASSIN or OPPONENT cards? If YES, choose a different word!
3. Are you connecting by meaning/category, NOT just spelling? If NO, choose a different word!

=== STEP 5: RESPOND ===

Think step-by-step:
1. Which ${myTeamCards.length} cards from YOUR TEAM can I connect?
2. What category or theme do they share?
3. Make sure clue word is not on board, this will be rejected.

Format:
{"targets": ["Card1", "Card2"], "word": "YOUR_CLUE", "count": 2, "reasoning": "Card1 and Card2 are both [category] so my clue is [word]"}

Example:
{"targets": ["Cat", "Dog"], "word": "Pet", "count": 2, "reasoning": "Cat and Dog are both common household pets"}`;
};

/**
 * Build prompt for CODEBREAKER to choose a card
 */
export const buildCodebreakerPrompt = (input: CodebreakerPromptInput): string => {
  const {
    clueWord,
    clueCount,
    availableCards,
    difficulty = "medium",
    previousClues = [],
    guessesRemaining,
  } = input;

  const difficultyInstructions = {
    easy: "Pick the most obvious match to the clue.",
    medium: "Think about semantic connections and context.",
    hard: "Consider multiple meanings, wordplay, and subtle connections.",
  };

  // Build previous clues section
  const previousCluesSection =
    previousClues.length > 0
      ? `

=== PREVIOUS CLUES FROM YOUR TEAM (for reference) ===

${previousClues
  .map((pc, i) => {
    const guessedCards = pc.guesses
      .map((g) => {
        const status = g.outcome === "CORRECT_TEAM_CARD" ? "✓ CORRECT" : "✗ WRONG";
        return `  - ${g.cardWord} (${status})`;
      })
      .join("\n");

    const remainingCount =
      pc.count - pc.guesses.filter((g) => g.outcome === "CORRECT_TEAM_CARD").length;
    const hasRemaining = remainingCount > 0 ? ` → ${remainingCount} card(s) still remaining!` : "";

    return `${i + 1}. Clue: "${pc.word}" for ${pc.count}${hasRemaining}
${guessedCards}`;
  })
  .join("\n\n")}

IMPORTANT: If a previous clue has remaining cards, you can use your EXTRA guess (beyond the current clue) to pick a card for an old clue!`
      : "";

  return `You are the CODEBREAKER in Codenames. Your CODEMASTER gave you a clue. Pick ONE card from the board.

=== CURRENT CLUE ===

Clue: "${clueWord}" for ${clueCount}
Guesses Remaining: ${guessesRemaining}

This means ${clueCount} of the cards below relate to "${clueWord}".${previousCluesSection}

=== AVAILABLE CARDS (the ONLY words you can pick from) ===

${availableCards.map((card, i) => `${i + 1}. ${card}`).join("\n")}

Total: ${availableCards.length} cards

=== STEP 1: UNDERSTAND THE RULES ===

1. Pick EXACTLY ONE card from the numbered list above
2. The card name must be spelled EXACTLY as shown
3. You CANNOT pick "${clueWord}" - it is the clue, NOT on the board
4. You CANNOT make up words - only choose from the ${availableCards.length} cards listed
5. Copy the card name character-for-character from the list

=== STEP 2: THINK ABOUT CONNECTIONS ===

For each card, ask: "How does this relate to '${clueWord}'?"

Good connections (meaning/category):
- Clue: "Animal" → Card: "Dog" (Dog is an animal)
- Clue: "Color" → Card: "Blue" (Blue is a color)
- Clue: "Water" → Card: "Ocean" (Ocean contains water)

Bad connections (spelling/rhyming):
- Clue: "Cat" → Card: "Hat" (just rhymes, not related by meaning!)
- Clue: "Book" → Card: "Look" (just similar spelling, not related!)

=== STEP 3: DECIDE WHICH CLUE TO USE ===

You have ${guessesRemaining} guess(es) remaining.

Current clue: "${clueWord}" for ${clueCount}
${
  previousClues.length > 0
    ? `Previous clues: ${
        previousClues.filter((pc) => {
          const remaining =
            pc.count - pc.guesses.filter((g) => g.outcome === "CORRECT_TEAM_CARD").length;
          return remaining > 0;
        }).length
      } with cards still remaining`
    : "No previous clues"
}

STRATEGY:
- If you have ${guessesRemaining} guesses and ${clueCount} for current clue, you have ${guessesRemaining - clueCount} EXTRA guess(es)
- Use extra guesses ONLY if you're confident about a card from a previous clue
- If unsure about previous clues, stick to the current clue "${clueWord}"

=== STEP 4: PICK YOUR CARD ===

Which card from the ${availableCards.length} options has the strongest connection?

Think:
1. Should I pick for "${clueWord}" (current) or a previous clue?
2. Which card am I MOST confident about?
3. Is the card name spelled EXACTLY as shown in the list? (Check!)

=== EXAMPLES ===

Clue: "Pet", Cards: ["Cat", "Book", "Mountain"]
Answer: {"card": "Cat", "reasoning": "Cat is a common household pet"}

Clue: "Sport", Cards: ["Soccer", "Piano", "Cloud"]
Answer: {"card": "Soccer", "reasoning": "Soccer is a sport"}

=== RESPOND ===

Format:
{"card": "EXACT_NAME_FROM_LIST", "reasoning": "This card relates to ${clueWord} because..."}

Remember: Copy the card name EXACTLY from the numbered list above!`;
};

/**
 * MULTI-AGENT DEBATE PROMPTS
 */

/**
 * Build debate proposal prompt for codebreaker (Phase 1)
 */
export const buildDebateCodebreakerProposalPrompt = (
  input: {
    clueWord: string;
    clueCount: number;
    availableCards: string[];
    previousClues: any[];
    guessesRemaining: number;
    currentGuessNumber: number;
  },
  agentId: number,
): string => {
  const {
    clueWord,
    clueCount,
    availableCards,
    previousClues,
    guessesRemaining,
    currentGuessNumber,
  } = input;

  const previousCluesSection =
    previousClues.length > 0
      ? `

=== PREVIOUS CLUES FROM YOUR TEAM ===

${previousClues
  .map((pc, i) => {
    const guessedCards = pc.guesses
      .map((g: any) => {
        const status = g.outcome === "CORRECT_TEAM_CARD" ? "✓ CORRECT" : "✗ WRONG";
        return `  - ${g.cardWord} (${status})`;
      })
      .join("\n");

    const remainingCount =
      pc.count - pc.guesses.filter((g: any) => g.outcome === "CORRECT_TEAM_CARD").length;
    const hasRemaining = remainingCount > 0 ? ` → ${remainingCount} card(s) still remaining!` : "";

    return `${i + 1}. Clue: "${pc.word}" for ${pc.count}${hasRemaining}
${guessedCards}`;
  })
  .join("\n\n")}`
      : "";

  return `You are Agent ${agentId}, a CODEBREAKER on a Codenames team. You are discussing with 2 other teammates which card to guess.

=== CURRENT SITUATION ===

Current Clue: "${clueWord}" for ${clueCount}
Guesses Remaining: ${guessesRemaining}
This is guess #${currentGuessNumber} of this turn
${previousCluesSection}

=== AVAILABLE CARDS (THE ONLY CARDS YOU CAN CHOOSE FROM!) ===

${availableCards.map((card, i) => `${i + 1}. ${card}`).join("\n")}

TOTAL: ${availableCards.length} cards

⚠️ WARNING: You MUST pick EXACTLY one card from the ${availableCards.length} cards listed above!
⚠️ DO NOT make up cards! DO NOT pick cards that aren't in this list!
⚠️ Copy the card name EXACTLY as shown (character-for-character)!

=== CRITICAL RULES ===

${
  currentGuessNumber === 1
    ? `
🚨 THIS IS YOUR FIRST GUESS - You MUST pick for the current clue "${clueWord}"
   Do NOT use extra guesses on the first card! You haven't made any guesses yet!
`
    : `
You have ${guessesRemaining - clueCount} extra guess(es) available.
You CAN target a previous clue if you're confident, OR stick with "${clueWord}".
`
}

=== YOUR TASK ===

Propose ONE card from the ${availableCards.length} cards listed above.

STEP-BY-STEP PROCESS:
1. Look at the ${availableCards.length} available cards above
2. For each card, ask: "Does this relate to '${clueWord}'?"
3. Pick the ONE card with the strongest connection
4. Copy its name EXACTLY from the list (check spelling!)

IMPORTANT:
- ❌ DO NOT proposenany card not in the list!
- ✅ ONLY pick from: ${availableCards.join(", ")}
- Explain the SEMANTIC connection (meaning/category), NOT spelling/rhyming
- State whether you're targeting the current clue or a previous clue

Response format:
{
  "card": "EXACT_NAME_FROM_LIST",
  "targetClue": "current" or "previous",
  "reasoning": "I propose [card] because it relates to [clue] by [explain semantic connection]"
}

Example (good):
{
  "card": "Tuba",
  "targetClue": "current",
  "reasoning": "I propose Tuba because it relates to MUSIC by being a musical instrument in orchestras and bands"
}

Example (bad - nonsensical):
{
  "card": "Piano",
  "targetClue": "current",
  "reasoning": "I propose Piano because it's shaped like a bread knife"
}

Your proposal:`;
};

/**
 * Build debate critique prompt for codebreaker (Phase 2)
 * NOTE: TypeScript has already filtered out invalid proposals!
 * This prompt only receives VALID proposals to debate quality.
 */
export const buildDebateCodebreakerCritiquePrompt = (
  input: {
    clueWord: string;
    clueCount: number;
    availableCards: string[];
    previousClues: any[];
    guessesRemaining: number;
    currentGuessNumber: number;
  },
  proposals: Array<{ card: string; reasoning: string; targetClue: string }>,
): string => {
  const { clueWord } = input;

  // Check if all agents agree
  const uniqueCards = new Set(proposals.map((p) => p.card));
  const allAgree = uniqueCards.size === 1;

  return `You are debating which card to guess in Codenames. All proposals below are VALID (already checked by code).

=== CURRENT CLUE ===
"${clueWord}"

=== VALID PROPOSALS (Code has already validated these) ===

${proposals
  .map(
    (p, i) => `
${i + 1}. "${p.card}" (targeting ${p.targetClue} clue)
   Reasoning: ${p.reasoning}
`,
  )
  .join("\n")}

=== YOUR TASK ===

${
  allAgree
    ? `
All agents agree on "${proposals[0].card}".

Check the reasoning:
- Does "${proposals[0].card}" actually relate to "${clueWord}"?
- Is the connection SEMANTIC (meaning/category) or nonsensical?
- Example NONSENSICAL: "Piano is a bread knife" ← Makes no sense!
- Example GOOD: "Tuba is a musical instrument" ← Clear connection

If the reasoning is sound, confirm. If nonsensical, explain why and suggest reconsidering.
`
    : `
Agents disagree: ${Array.from(uniqueCards).join(" vs ")}.

Debate:
1. Which has the STRONGEST semantic connection to "${clueWord}"?
2. Is any reasoning nonsensical or forced?
3. Which would a real Codenames player pick?

Examples of GOOD reasoning:
- "Dog relates to ANIMAL because it's a domesticated animal"
- "Ocean relates to WATER because oceans contain water"

Examples of BAD reasoning:
- "Slice relates to MUSIC because piano keys are sliced" ← Nonsense!
- "Hat relates to CAT because they rhyme" ← Not semantic!

Recommend the best option based on quality of reasoning and strength of connection.
`
}`;
};

/**
 * Build debate consensus prompt for codebreaker (Phase 3)
 * NOTE: Only receives VALID proposals (code has filtered invalid ones)
 */
export const buildDebateCodebreakerConsensusPrompt = (
  input: {
    clueWord: string;
    clueCount: number;
    availableCards: string[];
    previousClues: any[];
    guessesRemaining: number;
    currentGuessNumber: number;
  },
  proposals: Array<{ card: string; reasoning: string; targetClue: string }>,
  critiques: string[],
): string => {
  const { availableCards } = input;

  // Check if all agents agreed
  const uniqueCards = new Set(proposals.map((p) => p.card));
  const allAgree = uniqueCards.size === 1;

  return `Make the FINAL decision based on the debate. All proposals below are VALID (code verified).

=== VALID PROPOSALS ===

${proposals.map((p, i) => `${i + 1}. "${p.card}"`).join("\n")}

=== DEBATE ANALYSIS ===

${critiques.join("\n\n")}

=== YOUR DECISION ===

${
  allAgree
    ? `
All agents agreed on "${proposals[0].card}".

If the debate analysis confirmed this is a good choice, pick it.
If the debate found the reasoning nonsensical, pick a different card from available: ${availableCards.join(", ")}
`
    : `
Agents disagreed (${Array.from(uniqueCards).join(" vs ")}).

Follow the debate's recommendation for which has the strongest connection.
`
}

Response format (pick from available cards):
{
  "card": "EXACT_CARD_NAME",
  "reasoning": "Brief reason based on debate"
}`;
};

/**
 * Build debate proposal prompt for codemaster (Phase 1)
 */
export const buildDebateCodemasterProposalPrompt = (
  input: {
    myTeamCards: string[];
    opponentCards: string[];
    assassinCard: string;
    bystanderCards: string[];
  },
  agentId: number,
): string => {
  const { myTeamCards, opponentCards, assassinCard, bystanderCards } = input;

  const allBoardWords = [...myTeamCards, ...opponentCards, assassinCard, ...bystanderCards];

  return `You are Agent ${agentId}, a CODEMASTER in Codenames. You are discussing with 2 other teammates which clue to give.

=== YOUR TEAM'S CARDS ===

${myTeamCards.map((w, i) => `${i + 1}. ${w}`).join("\n")}

=== OPPONENT CARDS (avoid) ===
${opponentCards.join(", ")}

=== ASSASSIN (NEVER relate to this!) ===
${assassinCard}

=== BYSTANDER CARDS (avoid) ===
${bystanderCards.join(", ")}

=== FORBIDDEN CLUE WORDS ===
${allBoardWords.join(", ")}

=== YOUR TASK ===

Propose a ONE-WORD clue that connects 2-3 of YOUR TEAM'S cards.

IMPORTANT:
- Your clue CANNOT be any word from the forbidden list
- Connect by MEANING/CATEGORY, not spelling/rhyming
- Avoid connecting to OPPONENT, ASSASSIN, or BYSTANDER cards
- Pick 2-3 cards from YOUR TEAM that share a real semantic connection

Response format:
{
  "word": "YOUR_CLUE",
  "count": 2,
  "targets": ["Card1", "Card2"],
  "reasoning": "[Card1] and [Card2] both relate to [clue] because [explain semantic connection]"
}

Example (good):
{
  "word": "Animal",
  "count": 2,
  "targets": ["Lion", "Tiger"],
  "reasoning": "Lion and Tiger both relate to Animal because they are both wild cats in the animal kingdom"
}`;
};

/**
 * Build debate critique prompt for codemaster (Phase 2)
 */
export const buildDebateCodemasterCritiquePrompt = (
  input: {
    myTeamCards: string[];
    opponentCards: string[];
    assassinCard: string;
    bystanderCards: string[];
  },
  proposals: Array<{ word: string; count: number; targets: string[]; reasoning: string }>,
): string => {
  const { opponentCards, assassinCard, bystanderCards } = input;
  const allBoardWords = [...input.myTeamCards, ...opponentCards, assassinCard, ...bystanderCards];

  // Check if all agents agree
  const uniqueClues = new Set(proposals.map((p) => p.word.toLowerCase()));
  const allAgree = uniqueClues.size === 1;

  // Check for forbidden words
  const forbiddenViolations = proposals.filter((p) =>
    allBoardWords.some((w) => w.toLowerCase() === p.word.toLowerCase()),
  );

  return `You are validating clue proposals from 3 CODEMASTER teammates.

=== PROPOSALS ===

${proposals.map((p, i) => `Agent ${i + 1}: "${p.word}" for ${p.count} → ${p.targets.join(", ")}`).join("\n")}

=== DANGER ZONES ===
Opponent cards: ${opponentCards.join(", ")}
Assassin: ${assassinCard}
Bystanders: ${bystanderCards.join(", ")}
Forbidden words (on board): ${allBoardWords.join(", ")}

=== VALIDATION ===

${
  allAgree
    ? `
✓ All 3 agents agree on "${proposals[0].word}"
`
    : `
⚠️ Agents disagree: ${Array.from(uniqueClues).join(", ")}
`
}

${
  forbiddenViolations.length > 0
    ? `
🚨 ILLEGAL CLUE: ${forbiddenViolations.map((p) => p.word).join(", ")} - These words are on the board!
   This is against the rules! The clue CANNOT be a word from the board.
`
    : ""
}

=== YOUR RESPONSE ===

${
  forbiddenViolations.length > 0
    ? `
Some proposals are ILLEGAL (word is on the board). Reject those immediately.

For the LEGAL proposals:
1. Does the clue risk the assassin "${assassinCard}"?
2. Does it risk opponent cards?
3. Which is the safest?

Be direct and recommend the best LEGAL option.
`
    : allAgree
      ? `
All agents agree on "${proposals[0].word}" and it's not on the board.

Quickly check:
- Could "${proposals[0].word}" relate to the assassin "${assassinCard}"? (Bad!)
- Could it relate to opponent cards: ${opponentCards.join(", ")}? (Risky!)

If it seems safe, confirm. If risky, explain why.
`
      : `
Agents disagree. Compare the proposals:
1. Which has the safest distance from assassin "${assassinCard}"?
2. Which avoids opponent cards best?
3. Which has the strongest connections to target cards?

Recommend the best option.
`
}`;
};

/**
 * Build debate consensus prompt for codemaster (Phase 3)
 */
export const buildDebateCodemasterConsensusPrompt = (
  input: {
    myTeamCards: string[];
    opponentCards: string[];
    assassinCard: string;
    bystanderCards: string[];
  },
  proposals: Array<{ word: string; count: number; targets: string[]; reasoning: string }>,
  critiques: string[],
): string => {
  // Check if all agents agreed
  const uniqueClues = new Set(proposals.map((p) => p.word.toLowerCase()));
  const allAgree = uniqueClues.size === 1;

  return `Based on the team discussion, make the FINAL clue decision.

=== PROPOSALS ===

${proposals.map((p, i) => `Agent ${i + 1}: "${p.word}" for ${p.count} (${p.targets.join(", ")})`).join("\n")}

=== VALIDATION ===

${critiques.join("\n\n")}

=== FINAL DECISION ===

${
  allAgree
    ? `
All 3 agents agreed on "${proposals[0].word}".

If the critique confirmed this is safe, use it.
If the critique said it's illegal or risky, pick a safer alternative.
`
    : `
Agents disagreed. Follow the critique's recommendation for the safest clue.
`
}

Your team cards: ${input.myTeamCards.join(", ")}

Response format:
{
  "word": "YOUR_CLUE",
  "count": 2,
  "targets": ["Card1", "Card2"],
  "reasoning": "We chose [clue] because [brief reason based on critique]"
}

Remember: The clue word CANNOT be any word from the board!`;
};
