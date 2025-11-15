#!/bin/bash

# API wrapper for Codenames game
# Provides convenient functions for all game operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/codenames-token.sh"

API_BASE="http://localhost:3000/api"

# Make authenticated API request
# Set PLAYER_ID environment variable for player-specific token lookup
api_request() {
  local method="$1"
  local endpoint="$2"
  local data="$3"

  local token=$(get_token "$PLAYER_ID")
  if [ $? -ne 0 ]; then
    return 1
  fi

  if [ -z "$data" ]; then
    curl -s -X "$method" "${API_BASE}${endpoint}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json"
  else
    curl -s -X "$method" "${API_BASE}${endpoint}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
}

# Get game state
get_game_state() {
  local game_id="$1"
  api_request "GET" "/games/${game_id}"
}

# Join game
join_game() {
  local game_id="$1"
  local player_name="$2"
  local team_name="$3"

  local data=$(jq -n \
    --arg name "$player_name" \
    --arg team "$team_name" \
    '{playerName: $name, teamName: $team}')

  api_request "POST" "/games/${game_id}/players" "$data"
}

# Give clue (CODEMASTER only)
give_clue() {
  local game_id="$1"
  local round_num="$2"
  local player_id="$3"
  local clue_word="$4"
  local target_count="$5"

  local data=$(jq -n \
    --arg pid "$player_id" \
    --arg word "$clue_word" \
    --arg count "$target_count" \
    '{playerId: $pid, word: $word, targetCardCount: ($count | tonumber)}')

  api_request "POST" "/games/${game_id}/rounds/${round_num}/clues" "$data"
}

# Make guess (CODEBREAKER only)
make_guess() {
  local game_id="$1"
  local round_num="$2"
  local player_id="$3"
  local card_word="$4"

  local data=$(jq -n \
    --arg pid "$player_id" \
    --arg word "$card_word" \
    '{playerId: $pid, cardWord: $word}')

  api_request "POST" "/games/${game_id}/rounds/${round_num}/guesses" "$data"
}

# Export functions for use in other scripts
export -f api_request
export -f get_game_state
export -f join_game
export -f give_clue
export -f make_guess
