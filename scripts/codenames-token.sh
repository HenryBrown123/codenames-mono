#!/bin/bash

# Token management script for Codenames API
# Stores tokens in a JSON key-value store keyed by player ID

TOKEN_STORE="/tmp/codenames_tokens.json"

# Initialize token store if it doesn't exist
init_token_store() {
  if [ ! -f "$TOKEN_STORE" ]; then
    echo '{}' > "$TOKEN_STORE"
  fi
}

# Get token for a specific player ID, or create new guest if no player ID
get_token() {
  local player_id="${1:-}"
  local force_refresh="${2:-false}"

  init_token_store

  # If player ID is provided, try to get stored token
  if [ -n "$player_id" ] && [ "$force_refresh" = "false" ]; then
    local stored=$(jq -r --arg pid "$player_id" '.[$pid] // empty' "$TOKEN_STORE")

    if [ -n "$stored" ] && [ "$stored" != "null" ]; then
      local token=$(echo "$stored" | jq -r '.token')
      local expiry=$(echo "$stored" | jq -r '.expiry')
      local now=$(date +%s)

      # Token is valid if it expires more than 5 minutes from now
      if [ $((expiry - now)) -gt 300 ]; then
        echo "$token"
        return 0
      fi
    fi
  fi

  # Get new token
  local response=$(curl -s -X POST http://localhost:3000/api/auth/guests \
    -H "Content-Type: application/json")

  local token=$(echo "$response" | jq -r '.data.session.token')
  local username=$(echo "$response" | jq -r '.data.user.username')

  if [ "$token" = "null" ] || [ -z "$token" ]; then
    echo "ERROR: Failed to get authentication token" >&2
    return 1
  fi

  # Calculate expiry (tokens are valid for 7 days, we'll use 6 days to be safe)
  local expiry=$(($(date +%s) + 518400))

  # If player ID provided, store the token
  if [ -n "$player_id" ]; then
    local token_data=$(jq -n \
      --arg token "$token" \
      --arg username "$username" \
      --arg expiry "$expiry" \
      '{token: $token, username: $username, expiry: ($expiry | tonumber)}')

    jq --arg pid "$player_id" --argjson data "$token_data" \
      '.[$pid] = $data' "$TOKEN_STORE" > "${TOKEN_STORE}.tmp"
    mv "${TOKEN_STORE}.tmp" "$TOKEN_STORE"

    echo "INFO: Authenticated as $username for player $player_id" >&2
  else
    echo "INFO: Authenticated as $username (no player ID)" >&2
  fi

  echo "$token"
}

# Save token for a player ID
save_token_for_player() {
  local player_id="$1"
  local token="$2"
  local username="${3:-unknown}"

  init_token_store

  # Calculate expiry (tokens are valid for 7 days, we'll use 6 days to be safe)
  local expiry=$(($(date +%s) + 518400))

  local token_data=$(jq -n \
    --arg token "$token" \
    --arg username "$username" \
    --arg expiry "$expiry" \
    '{token: $token, username: $username, expiry: ($expiry | tonumber)}')

  jq --arg pid "$player_id" --argjson data "$token_data" \
    '.[$pid] = $data' "$TOKEN_STORE" > "${TOKEN_STORE}.tmp"
  mv "${TOKEN_STORE}.tmp" "$TOKEN_STORE"

  echo "INFO: Saved token for player $player_id ($username)" >&2
}

# List all stored tokens
list_tokens() {
  init_token_store
  jq '.' "$TOKEN_STORE"
}

# Export functions
export -f get_token
export -f save_token_for_player
export -f list_tokens

# Main execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  case "${1:-get}" in
    get)
      get_token "$2" "$3"
      ;;
    save)
      save_token_for_player "$2" "$3" "$4"
      ;;
    list)
      list_tokens
      ;;
    *)
      echo "Usage: $0 {get|save|list} [player_id] [token] [username]"
      echo ""
      echo "Commands:"
      echo "  get [player_id] [force_refresh]  - Get token for player (or create new guest)"
      echo "  save <player_id> <token> [username] - Save token for player"
      echo "  list                               - List all stored tokens"
      exit 1
      ;;
  esac
fi
