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
3. Is my clue word on the board? (Check the CANNOT USE list!)

Format:
{"targets": ["Card1", "Card2"], "word": "YOUR_CLUE", "count": 2, "reasoning": "Card1 and Card2 are both [category] so my clue is [word]"}

Example:
{"targets": ["Cat", "Dog"], "word": "Pet", "count": 2, "reasoning": "Cat and Dog are both common household pets"}`;
};

/**
 * Build prompt for CODEBREAKER to choose a card
 */
export const buildCodebreakerPrompt = (input: CodebreakerPromptInput): string => {
  const { clueWord, clueCount, availableCards, difficulty = "medium" } = input;

  const difficultyInstructions = {
    easy: "Pick the most obvious match to the clue.",
    medium: "Think about semantic connections and context.",
    hard: "Consider multiple meanings, wordplay, and subtle connections.",
  };

  return `You are the CODEBREAKER in Codenames. Your CODEMASTER gave you a clue. Pick ONE card from the board.

=== THE CLUE ===

Clue: "${clueWord}" for ${clueCount}

This means ${clueCount} of the cards below relate to "${clueWord}".

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

=== STEP 3: PICK YOUR CARD ===

Which card from the ${availableCards.length} options has the strongest connection to "${clueWord}"?

Think:
1. What does "${clueWord}" mean?
2. Which card is related to that meaning?
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
