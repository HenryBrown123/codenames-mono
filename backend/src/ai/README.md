# AI Player System

Server-side AI for Codenames using local LLM (Ollama).

## Architecture

```
ai/
├── llm/
│   └── local-llm.service.ts      # Ollama API wrapper
├── strategy/
│   └── ai-prompts.ts              # Prompt templates for CODEMASTER/CODEBREAKER
├── events/
│   └── game-event-bus.ts          # Server-side event system
├── ai-player/
│   └── ai-player.service.ts       # Main AI logic + event listeners
└── index.ts                        # Public exports
```

## How It Works

1. **Event-Driven**: AI listens to game events (`TURN_ENDED`, `CLUE_GIVEN`, `GUESS_MADE`)
2. **Functional**: All services use factory functions, no classes
3. **Local LLM**: Uses Ollama (free, runs at `localhost:11434`)
4. **Realistic Delays**: 1-3s for clues, 2-4s for guesses
5. **One at a time**: Prevents multiple codebreakers from guessing simultaneously

## Event Flow

```
TURN_ENDED → Check if AI CODEMASTER → Give Clue (after 1-3s delay)
                ↓
            CLUE_GIVEN → Check if AI CODEBREAKER → Make Guess (after 2-4s delay)
                ↓
            GUESS_MADE → If CORRECT + guesses left → Make Another Guess
```

## Setup

### 1. Install Ollama
```bash
brew install ollama
brew services start ollama
```

### 2. Pull a Model
```bash
ollama pull qwen2.5:14b  # Recommended: 14B parameter model (9 GB)
# or
ollama pull qwen2.5:7b   # Lighter: 7B parameter model (4.7 GB)
# or
ollama pull qwen2.5:3b   # Lightest: 3B parameter model (1.9 GB)
```

### 3. Initialize AI Service (in your app startup)
```typescript
import { createLocalLLMService, createAIPlayerService } from "@backend/ai";
import { giveClueService } from "@backend/gameplay/give-clue";
import { makeGuessService } from "@backend/gameplay/make-guess";
import { getGameplayState } from "@backend/gameplay/state";

// Create LLM service
const llm = createLocalLLMService({
  ollamaUrl: "http://localhost:11434",
  model: "qwen2.5:14b",
  temperature: 0.7,
});

// Create AI player service
const aiPlayer = createAIPlayerService({
  llm,
  giveClue: giveClueService(/* dependencies */),
  makeGuess: makeGuessService(/* dependencies */),
  getGameState: getGameplayState,
});

// Start listening to events
aiPlayer.initialize();
```

## Creating AI Players

### Option 1: Add via API Endpoint (TODO)
```bash
POST /api/games/:gameId/ai-players
{
  "playerName": "AI-Bot-1",
  "teamName": "Team Red",
  "difficulty": "medium"
}
```

### Option 2: Set Existing Player as AI
```sql
UPDATE players
SET is_ai = true
WHERE public_id = 'player-id-here';
```

## Difficulty Levels

- **easy**: Simple 1-2 card clues, obvious guesses
- **medium**: Thoughtful 2-3 card clues, semantic reasoning
- **hard**: Clever 3+ card clues, wordplay, calculated risks

## Database Schema

```sql
ALTER TABLE players ADD COLUMN is_ai BOOLEAN NOT NULL DEFAULT false;
```

## How AI Makes Decisions

### CODEMASTER (Giving Clues)
1. Get all cards with team assignments (only CODEMASTER can see this)
2. Build prompt with: my cards, opponent cards, assassin, bystanders
3. LLM generates JSON: `{"word": "ANIMAL", "count": 3}`
4. Call `giveClueService` with the clue

### CODEBREAKER (Making Guesses)
1. Get clue word + count from current turn
2. Get all unselected cards
3. Build prompt asking to pick best match
4. LLM generates JSON: `{"card": "DOG"}`
5. Call `makeGuessService` with the card

## Testing

```bash
# 1. Start your backend
npm run dev

# 2. Create a game and mark a player as AI
psql -d codenames -c "UPDATE players SET is_ai = true WHERE public_name = 'Test-Bot';"

# 3. Start the game - AI will automatically play!
```

## Logs

AI actions are logged to console:
```
[AI] player-id giving clue: OCEAN for 2
[AI] player-id guessing: FISH
[AI] Guess result: CORRECT
```

## Next Steps (TODO)

- [ ] Add AI player creation endpoint
- [ ] Add difficulty selection in frontend
- [ ] Add AI thinking indicators (websocket events)
- [ ] Improve prompts with few-shot examples
- [ ] Add retry logic for failed LLM calls
- [ ] Add AI player stats tracking
