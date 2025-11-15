# AI Agent Instructions: Play Codenames Game

You are an AI agent that can play Codenames as either a CODEMASTER or CODEBREAKER. Follow these instructions to join and play games.

## Quick Start (Automated Scripts)

**The fastest way to play is using the automated bash scripts:**

```bash
# Start playing with automatic polling (polls every 10 seconds)
./scripts/codenames-play.sh <GAME_ID> [PLAYER_NAME] [TEAM_NAME] [POLL_INTERVAL]

# Example:
./scripts/codenames-play.sh mDgvmAuvt "Claude-AI" "Team Red" 10
```

**What this does:**
- Automatically authenticates and manages JWT tokens (cached in `/tmp`)
- Joins the specified game and team
- Polls the game state every N seconds (default: 10)
- Automatically makes intelligent moves when it's your turn
- Handles CODEMASTER (giving clues) and CODEBREAKER (making guesses) roles
- Colorized output shows what's happening in real-time

**Available Scripts:**
- `scripts/codenames-token.sh` - Token management with automatic refresh
- `scripts/codenames-api.sh` - API wrapper functions (get_game_state, join_game, give_clue, make_guess)
- `scripts/codenames-strategy.sh` - AI strategy for choosing clues and cards
- `scripts/codenames-play.sh` - Main automated play loop

**For manual control, see the sections below.**

## System Architecture

- **Backend**: REST API at `http://localhost:3000/api`
- **Database**: PostgreSQL at `postgresql://postgres:dev@localhost:5432/postgres`
- **Auth**: JWT tokens via `/api/auth/guests` endpoint
- **Game Types**: MULTI_DEVICE (each player has own device/session)

## Quick Start: Join and Play

### 1. Get Authentication Token

```bash
# Create guest user and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/guests -H "Content-Type: application/json" | jq -r '.data.token')
```

### 2. Join Existing Game

```bash
# Join game with ID {GAME_ID}
GAME_ID="abc123"
PLAYER_NAME="AI-Player-$(date +%s)"
TEAM_NAME="Team Red"  # or "Team Blue"

# Join the game (teamName is REQUIRED)
JOIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/players" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"playerName\": \"${PLAYER_NAME}\", \"teamName\": \"${TEAM_NAME}\"}")

# Extract your player ID
PLAYER_ID=$(echo $JOIN_RESPONSE | jq -r '.data.players[0].id')
```

### 3. Check Game State

```bash
# Get current game state (includes your role and team)
curl -s "http://localhost:3000/api/games/${GAME_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
```

**Key response fields:**
- `.data.playerContext.role` - Your role: "CODEMASTER" or "CODEBREAKER"
- `.data.playerContext.teamName` - Your team: "Team Red" or "Team Blue"
- `.data.playerContext.publicId` - Your player ID (use for actions)
- `.data.currentRound.turns[-1]` - Active turn info
- `.data.currentRound.turns[-1].teamName` - Whose turn it is
- `.data.currentRound.cards[]` - Board cards (visible fields depend on role)

### 4. Play as CODEMASTER

**Check if it's your turn:**
```bash
# You can give clue if:
# - activeTurn.teamName == playerContext.teamName
# - activeTurn.clue == null
```

**Give a clue:**
```bash
ROUND_NUM=1  # Usually 1
CLUE_WORD="OCEAN"
TARGET_COUNT=2

curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/rounds/${ROUND_NUM}/clues" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"playerId\": \"${PLAYER_ID}\",
    \"word\": \"${CLUE_WORD}\",
    \"targetCardCount\": ${TARGET_COUNT}
  }"
```

**As CODEMASTER you can see:**
- `.data.currentRound.cards[].teamName` - Which team owns each card
- `.data.currentRound.cards[].cardType` - "TEAM_CARD", "BYSTANDER", "ASSASSIN"

**Strategy tips:**
- Find words that connect multiple cards of your team
- Avoid words that connect to ASSASSIN or other team's cards
- targetCardCount = number of your team's cards the word relates to

### 5. Play as CODEBREAKER

**Check if it's your turn:**
```bash
# You can guess if:
# - activeTurn.teamName == playerContext.teamName
# - activeTurn.clue != null
# - activeTurn.guessesRemaining > 0
```

**Make a guess:**
```bash
CARD_WORD="Boat"

curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/rounds/${ROUND_NUM}/guesses" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"playerId\": \"${PLAYER_ID}\",
    \"cardWord\": \"${CARD_WORD}\"
  }"
```

**Response includes:**
- `.data.guess.outcome` - "CORRECT", "BYSTANDER", "OTHER_TEAM_CARD", "ASSASSIN"
- `.data.turn.guessesRemaining` - How many guesses left
- `.data.turn.status` - "ACTIVE" or "COMPLETED"

**Guess outcomes:**
- **CORRECT** - Your team's card, can continue guessing
- **BYSTANDER** - Neutral card, turn ends
- **OTHER_TEAM_CARD** - Other team's card, turn ends, helps them
- **ASSASSIN** - Game over, your team loses immediately

**Strategy tips:**
- Use the clue word and number to find related cards
- You get targetCardCount + 1 guesses (bonus guess for previous turns)
- Be cautious - wrong guesses end your turn or worse

## Database Queries (for game inspection)

### Check player roles in game
```bash
psql postgresql://postgres:dev@localhost:5432/postgres -c "
  SELECT p.public_id, p.public_name, u.username, t.team_name, pr.role_name
  FROM players p
  JOIN users u ON p.user_id = u.id
  JOIN teams t ON p.team_id = t.id
  JOIN games g ON t.game_id = g.id
  LEFT JOIN player_round_roles prr ON p.id = prr.player_id
  LEFT JOIN player_roles pr ON prr.role_id = pr.id
  WHERE g.public_id = '${GAME_ID}'
  ORDER BY t.team_name, p.public_name;
"
```

### Check recent games
```bash
psql postgresql://postgres:dev@localhost:5432/postgres -c "
  SELECT g.public_id, gs.status_name, g.game_type
  FROM games g
  JOIN game_status gs ON g.status_id = gs.id
  ORDER BY g.id DESC
  LIMIT 5;
"
```

## Complete Play Loop Example

```bash
#!/bin/bash

# Setup
GAME_ID="$1"  # Pass game ID as argument
TEAM_NAME="${2:-Team Red}"  # Pass team name as second argument, defaults to "Team Red"
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/guests -H "Content-Type: application/json" | jq -r '.data.session.token')
PLAYER_NAME="AI-Bot-$(date +%s)"

# Join game
JOIN=$(curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/players" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"playerName\": \"${PLAYER_NAME}\", \"teamName\": \"${TEAM_NAME}\"}")
PLAYER_ID=$(echo $JOIN | jq -r '.data.players[0].id')

echo "Joined as ${PLAYER_NAME} (${PLAYER_ID}) on ${TEAM_NAME}"

# Game loop
while true; do
  sleep 2  # Poll every 2 seconds

  # Get game state
  STATE=$(curl -s "http://localhost:3000/api/games/${GAME_ID}" -H "Authorization: Bearer ${TOKEN}")

  ROLE=$(echo $STATE | jq -r '.data.playerContext.role')
  MY_TEAM=$(echo $STATE | jq -r '.data.playerContext.teamName')
  TURN_TEAM=$(echo $STATE | jq -r '.data.currentRound.turns[-1].teamName')
  HAS_CLUE=$(echo $STATE | jq -r '.data.currentRound.turns[-1].clue != null')
  GUESSES_LEFT=$(echo $STATE | jq -r '.data.currentRound.turns[-1].guessesRemaining')
  GAME_STATUS=$(echo $STATE | jq -r '.data.status')

  # Check if game is over
  if [ "$GAME_STATUS" != "IN_PROGRESS" ]; then
    echo "Game ended: $GAME_STATUS"
    break
  fi

  # Not my turn
  if [ "$MY_TEAM" != "$TURN_TEAM" ]; then
    echo "Waiting... (${TURN_TEAM}'s turn)"
    continue
  fi

  # My turn as CODEMASTER
  if [ "$ROLE" = "CODEMASTER" ] && [ "$HAS_CLUE" = "false" ]; then
    echo "Giving clue..."

    # Get my team's cards
    MY_CARDS=$(echo $STATE | jq -r "[.data.currentRound.cards[] | select(.teamName == \"${MY_TEAM}\" and .selected == false) | .word] | .[0:3]")

    # Simple strategy: give a clue for 2 cards
    curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/rounds/1/clues" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"playerId\": \"${PLAYER_ID}\", \"word\": \"CLUE\", \"targetCardCount\": 2}" > /dev/null

    echo "Clue given: CLUE for 2"
  fi

  # My turn as CODEBREAKER
  if [ "$ROLE" = "CODEBREAKER" ] && [ "$HAS_CLUE" = "true" ] && [ "$GUESSES_LEFT" -gt 0 ]; then
    echo "Making guess..."

    # Get unselected cards
    AVAILABLE=$(echo $STATE | jq -r '[.data.currentRound.cards[] | select(.selected == false) | .word] | .[0]')

    # Make guess
    RESULT=$(curl -s -X POST "http://localhost:3000/api/games/${GAME_ID}/rounds/1/guesses" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"playerId\": \"${PLAYER_ID}\", \"cardWord\": \"${AVAILABLE}\"}")

    OUTCOME=$(echo $RESULT | jq -r '.data.guess.outcome')
    echo "Guessed ${AVAILABLE}: ${OUTCOME}"

    # Stop guessing on bad outcomes
    if [ "$OUTCOME" != "CORRECT" ]; then
      echo "Turn ended"
    fi
  fi
done
```

## Advanced: Strategy Tips for LLM Agents

### CODEMASTER Strategy
1. **Analyze the board**: Get all cards with `.teamName` matching yours
2. **Find semantic connections**: Use word embeddings/associations to find words that connect multiple cards
3. **Avoid danger**: Check ASSASSIN and other team's cards - avoid words that relate to them
4. **Optimal count**: Give clues for 2-3 cards typically (balance risk vs reward)

### CODEBREAKER Strategy
1. **Parse the clue**: Extract word and number from `activeTurn.clue`
2. **Find associations**: Look at unselected cards, find semantic similarity to clue word
3. **Use the number**: The number tells you how many cards relate to the clue
4. **Risk management**: First guess should be strongest association, later guesses more risky

## WebSocket Events (for real-time updates)

Instead of polling, you can connect to WebSocket for real-time events:

```javascript
// Connect to WebSocket (requires socket.io client)
const socket = io('http://localhost:3000', {
  auth: { token: YOUR_JWT_TOKEN }
});

// Join game room
socket.emit('join_game', { gameId: GAME_ID });

// Listen for events
socket.on('clue_given', (data) => {
  console.log('Clue given:', data);
});

socket.on('guess_made', (data) => {
  console.log('Guess made:', data);
});

socket.on('turn_completed', (data) => {
  console.log('Turn completed:', data);
});
```

## Error Handling

Common errors and fixes:

- **"Required" for teamName**: Must include `"teamName": "Team Red"` or `"Team Blue"` when joining game
- **"Expected array, received object"**: Wrong request body format, ensure JSON matches examples
- **"Invalid game state"**: Check if it's your turn and role can perform action
- **"Player ID is required"**: Make sure you're using correct `playerId` from join response (check path: `.data.players[0].id` not `.data.player.publicId`)
- **"Invalid literal value, expected CODEMASTER"**: You're a CODEBREAKER trying to give clue
- **"Card not found"**: Check spelling, card words are case-sensitive
- **401 Unauthorized**: Token expired or invalid, get new token
- **Token path issues**: Use `.data.session.token` not `.data.token` when creating guest auth

## Token Conservation Tips

To save LLM tokens when playing:

1. **Filter API responses**: Use `jq` to extract only needed fields
2. **Cache game state**: Only fetch when your turn or events occur
3. **Use DB queries**: For static data (roles, teams) use direct DB queries
4. **Batch operations**: Make decisions based on full state, not incremental updates

## Example: Efficient State Check

```bash
# Instead of full JSON, extract just what you need
IS_MY_TURN=$(curl -s "http://localhost:3000/api/games/${GAME_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | \
  jq -r '(.data.playerContext.teamName == .data.currentRound.turns[-1].teamName)')

if [ "$IS_MY_TURN" = "true" ]; then
  # Only fetch full state when it's your turn
  STATE=$(curl -s "http://localhost:3000/api/games/${GAME_ID}" -H "Authorization: Bearer ${TOKEN}")
  # ... play your turn
fi
```

## Testing Your Agent

```bash
# 1. Start a new game via UI at http://localhost:8000
# 2. Note the game ID from URL: /game/{GAME_ID}/lobby
# 3. Run your agent script with the game ID
./play_codenames.sh {GAME_ID}
```

Your agent will join as a player and play automatically!
