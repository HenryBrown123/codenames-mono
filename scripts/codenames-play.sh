#!/bin/bash

# Main Codenames AI Player Script
# Automatically joins a game and plays with polling

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/codenames-api.sh"
source "${SCRIPT_DIR}/codenames-strategy.sh"

GAME_ID="${1}"
PLAYER_NAME="${2:-AI-Claude-$(date +%s)}"
TEAM_NAME="${3:-Team Red}"
POLL_INTERVAL="${4:-10}"  # Poll every 10 seconds by default

PLAYER_ID_FILE="/tmp/codenames_player_${GAME_ID}.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

log_error() {
  echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" >&2
}

log_info() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

log_turn() {
  echo -e "${YELLOW}[$(date +'%H:%M:%S')] TURN:${NC} $1"
}

# Usage check
if [ -z "$GAME_ID" ]; then
  echo "Usage: $0 <GAME_ID> [PLAYER_NAME] [TEAM_NAME] [POLL_INTERVAL_SECONDS]"
  echo ""
  echo "Example:"
  echo "  $0 mDgvmAuvt \"Claude-AI\" \"Team Red\" 10"
  echo ""
  echo "Arguments:"
  echo "  GAME_ID               - Game ID to join (required)"
  echo "  PLAYER_NAME           - Your player name (default: AI-Claude-<timestamp>)"
  echo "  TEAM_NAME             - Team to join: 'Team Red' or 'Team Blue' (default: Team Red)"
  echo "  POLL_INTERVAL_SECONDS - How often to check game state (default: 10)"
  exit 1
fi

# Join game or get existing player ID
if [ -f "$PLAYER_ID_FILE" ]; then
  PLAYER_ID=$(cat "$PLAYER_ID_FILE")
  log_info "Using existing player ID: $PLAYER_ID"
else
  log "Joining game $GAME_ID as $PLAYER_NAME on $TEAM_NAME..."

  # Get a new token for joining (no player ID yet)
  join_token=$(get_token "")
  if [ $? -ne 0 ]; then
    log_error "Failed to get authentication token"
    exit 1
  fi

  # Join the game
  join_data=$(jq -n \
    --arg name "$PLAYER_NAME" \
    --arg team "$TEAM_NAME" \
    '{playerName: $name, teamName: $team}')

  join_response=$(curl -s -X POST "${API_BASE}/games/${GAME_ID}/players" \
    -H "Authorization: Bearer ${join_token}" \
    -H "Content-Type: application/json" \
    -d "$join_data")

  success=$(echo "$join_response" | jq -r '.success')
  if [ "$success" != "true" ]; then
    error=$(echo "$join_response" | jq -r '.error // "Unknown error"')
    log_error "Failed to join game: $error"
    exit 1
  fi

  PLAYER_ID=$(echo "$join_response" | jq -r '.data.players[0].id')
  echo "$PLAYER_ID" > "$PLAYER_ID_FILE"

  # Save the token for this player ID
  save_token_for_player "$PLAYER_ID" "$join_token" "$PLAYER_NAME"

  log "Successfully joined! Player ID: $PLAYER_ID"
fi

# Export PLAYER_ID for use by API functions
export PLAYER_ID

# Game loop
log "Starting game loop (polling every ${POLL_INTERVAL}s)..."
log "Press Ctrl+C to stop"
echo ""

LAST_TURN_ID=""
GAME_STARTED="false"

while true; do
  sleep "$POLL_INTERVAL"

  # Get current game state
  game_state=$(get_game_state "$GAME_ID")

  success=$(echo "$game_state" | jq -r '.success')
  if [ "$success" != "true" ]; then
    log_error "Failed to get game state"
    continue
  fi

  # Extract key information
  game_status=$(echo "$game_state" | jq -r '.data.game.status')
  my_role=$(echo "$game_state" | jq -r '.data.playerContext.role // empty')
  my_team=$(echo "$game_state" | jq -r '.data.playerContext.teamName // empty')

  # Check if game has ended
  if [ "$game_status" = "COMPLETED" ]; then
    log "🎮 Game has ended!"
    winner=$(echo "$game_state" | jq -r '.data.game.winner // "Unknown"')
    log "Winner: $winner"
    break
  fi

  # Waiting in lobby
  if [ "$game_status" = "LOBBY" ]; then
    if [ "$GAME_STARTED" = "false" ]; then
      log_info "Waiting in lobby for game to start..."
      GAME_STARTED="waiting"
    fi
    continue
  fi

  # Game has started
  if [ "$game_status" = "IN_PROGRESS" ] && [ "$GAME_STARTED" != "true" ]; then
    log "🎮 Game started! I am $my_role on $my_team"
    GAME_STARTED="true"
  fi

  # Check if it's my turn
  turn_check=$(is_my_turn "$game_state")

  if [ "$turn_check" = "false" ]; then
    turn_team=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].teamName // "Unknown"')
    log_info "Waiting... (${turn_team}'s turn)"
    continue
  fi

  # Get current turn ID to avoid duplicate actions
  current_turn_id=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].id // empty')
  if [ "$current_turn_id" = "$LAST_TURN_ID" ]; then
    continue
  fi

  # Play as CODEMASTER
  if [ "$turn_check" = "CODEMASTER" ]; then
    log_turn "🎯 My turn to give a clue!"

    clue_data=$(generate_clue "$game_state")
    if [ "$clue_data" = "null" ]; then
      log_error "No cards available to give clue"
      continue
    fi

    clue_word=$(echo "$clue_data" | jq -r '.word')
    target_count=$(echo "$clue_data" | jq -r '.targetCount')
    round_num=$(echo "$game_state" | jq -r '.data.currentRound.roundNumber')

    log_turn "Giving clue: '$clue_word' for $target_count cards"

    result=$(give_clue "$GAME_ID" "$round_num" "$PLAYER_ID" "$clue_word" "$target_count")
    success=$(echo "$result" | jq -r '.success')

    if [ "$success" = "true" ]; then
      log "✅ Clue given successfully!"
      LAST_TURN_ID="$current_turn_id"
    else
      error=$(echo "$result" | jq -r '.error // "Unknown error"')
      log_error "Failed to give clue: $error"
    fi
  fi

  # Play as CODEBREAKER
  if [ "$turn_check" = "CODEBREAKER" ]; then
    log_turn "🤔 My turn to guess!"

    card_data=$(choose_card "$game_state")
    if [ "$card_data" = "null" ]; then
      log_error "No cards available to guess"
      continue
    fi

    chosen_card=$(echo "$card_data" | jq -r '.card')
    round_num=$(echo "$game_state" | jq -r '.data.currentRound.roundNumber')

    log_turn "Guessing: $chosen_card"

    result=$(make_guess "$GAME_ID" "$round_num" "$PLAYER_ID" "$chosen_card")
    success=$(echo "$result" | jq -r '.success')

    if [ "$success" = "true" ]; then
      outcome=$(echo "$result" | jq -r '.data.guess.outcome')
      guesses_left=$(echo "$result" | jq -r '.data.turn.guessesRemaining')

      case "$outcome" in
        "CORRECT")
          log "✅ Correct! Our team's card. ($guesses_left guesses remaining)"
          ;;
        "BYSTANDER")
          log "⚪ Bystander - turn ended"
          LAST_TURN_ID="$current_turn_id"
          ;;
        "OTHER_TEAM_CARD")
          log "❌ Other team's card - turn ended"
          LAST_TURN_ID="$current_turn_id"
          ;;
        "ASSASSIN")
          log "💀 ASSASSIN - we lost!"
          LAST_TURN_ID="$current_turn_id"
          ;;
      esac
    else
      error=$(echo "$result" | jq -r '.error // "Unknown error"')
      log_error "Failed to make guess: $error"
    fi
  fi
done

log "Game loop ended"
