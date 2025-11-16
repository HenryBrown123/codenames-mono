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

  return `You are playing Codenames as CODEMASTER.

YOUR TEAM'S CARDS (you want your team to guess these):
${myTeamCards.join(", ")}

OPPONENT'S CARDS (avoid these):
${opponentCards.join(", ")}

ASSASSIN CARD (NEVER hint at this, instant loss):
${assassinCard}

BYSTANDER CARDS (neutral, avoid if possible):
${bystanderCards.join(", ")}

DIFFICULTY: ${difficulty}
${difficultyInstructions[difficulty]}

Give ONE clue word and a number. The number indicates how many of YOUR TEAM'S CARDS relate to the clue.
The clue MUST NOT be any word on the board or a form of any word on the board.

Think strategically:
- Find connections between multiple cards on your team
- Avoid words that connect to the ASSASSIN or opponent cards
- The clue should be semantic/conceptual, not just similar spelling

Respond ONLY with valid JSON in this exact format:
{"word": "YOUR_CLUE_WORD", "count": 2}`;
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

  return `You are playing Codenames as CODEBREAKER.

CLUE: ${clueWord} ${clueCount}

AVAILABLE CARDS (not yet selected):
${availableCards.join(", ")}

DIFFICULTY: ${difficulty}
${difficultyInstructions[difficulty]}

The CODEMASTER gave you the clue "${clueWord}" for ${clueCount} cards.
Choose the card that BEST matches the clue.

Think about:
- Semantic similarity (meaning, not just spelling)
- Context and associations
- The number tells you how many cards relate to this clue

Respond ONLY with valid JSON in this exact format:
{"card": "CHOSEN_CARD"}

The card MUST be one of the available cards listed above, spelled EXACTLY as shown.`;
};
