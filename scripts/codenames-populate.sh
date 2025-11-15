#!/bin/bash

# Populate a Codenames game with AI players
# Creates multiple AI players across both teams and saves all tokens

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/codenames-token.sh"

GAME_ID="${1}"
PLAYERS_PER_TEAM="${2:-2}"  # Default: 2 players per team
AUTO_START="${3:-yes}"      # Default: automatically start monitoring

API_BASE="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[POPULATE]${NC} $1"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Usage check
if [ -z "$GAME_ID" ]; then
  echo "Usage: $0 <GAME_ID> [PLAYERS_PER_TEAM] [AUTO_START]"
  echo ""
  echo "Example:"
  echo "  $0 I43OhV2mx 2 yes    # Creates 2 players per team and starts monitoring"
  echo "  $0 I43OhV2mx 2 no     # Creates players but doesn't start monitoring"
  echo ""
  echo "Arguments:"
  echo "  GAME_ID           - Game ID to populate (required)"
  echo "  PLAYERS_PER_TEAM  - Number of players per team (default: 2)"
  echo "  AUTO_START        - Auto-start monitoring: 'yes' or 'no' (default: yes)"
  exit 1
fi

log "Populating game $GAME_ID with $PLAYERS_PER_TEAM players per team..."
echo ""

# Arrays to store player info
declare -a PLAYER_IDS
declare -a PLAYER_NAMES
declare -a PLAYER_TEAMS
declare -a PLAYER_TOKENS

# Create players for Team Red
log "Creating Team Red players..."
for i in $(seq 1 $PLAYERS_PER_TEAM); do
  PLAYER_NAME="AI-Red-${i}"

  # Get authentication token
  log_info "Authenticating ${PLAYER_NAME}..."
  auth_response=$(curl -s -X POST http://localhost:3000/api/auth/guests \
    -H "Content-Type: application/json")

  token=$(echo "$auth_response" | jq -r '.data.session.token')
  username=$(echo "$auth_response" | jq -r '.data.user.username')

  if [ "$token" = "null" ] || [ -z "$token" ]; then
    echo "ERROR: Failed to authenticate ${PLAYER_NAME}"
    continue
  fi

  log_info "Authenticated as $username"

  # Join game
  log_info "Joining game as ${PLAYER_NAME}..."
  join_data=$(jq -n \
    --arg name "$PLAYER_NAME" \
    '{playerName: $name, teamName: "Team Red"}')

  join_response=$(curl -s -X POST "${API_BASE}/games/${GAME_ID}/players" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "$join_data")

  success=$(echo "$join_response" | jq -r '.success')
  if [ "$success" != "true" ]; then
    error=$(echo "$join_response" | jq -r '.error // "Unknown error"')
    echo "ERROR: Failed to join game: $error"
    continue
  fi

  player_id=$(echo "$join_response" | jq -r '.data.players[0].id')

  # Save token for this player
  save_token_for_player "$player_id" "$token" "$PLAYER_NAME" 2>/dev/null

  # Store player info
  PLAYER_IDS+=("$player_id")
  PLAYER_NAMES+=("$PLAYER_NAME")
  PLAYER_TEAMS+=("Team Red")
  PLAYER_TOKENS+=("$token")

  log "✓ ${PLAYER_NAME} joined (ID: ${player_id})"
done

echo ""

# Create players for Team Blue
log "Creating Team Blue players..."
for i in $(seq 1 $PLAYERS_PER_TEAM); do
  PLAYER_NAME="AI-Blue-${i}"

  # Get authentication token
  log_info "Authenticating ${PLAYER_NAME}..."
  auth_response=$(curl -s -X POST http://localhost:3000/api/auth/guests \
    -H "Content-Type: application/json")

  token=$(echo "$auth_response" | jq -r '.data.session.token')
  username=$(echo "$auth_response" | jq -r '.data.user.username')

  if [ "$token" = "null" ] || [ -z "$token" ]; then
    echo "ERROR: Failed to authenticate ${PLAYER_NAME}"
    continue
  fi

  log_info "Authenticated as $username"

  # Join game
  log_info "Joining game as ${PLAYER_NAME}..."
  join_data=$(jq -n \
    --arg name "$PLAYER_NAME" \
    '{playerName: $name, teamName: "Team Blue"}')

  join_response=$(curl -s -X POST "${API_BASE}/games/${GAME_ID}/players" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "$join_data")

  success=$(echo "$join_response" | jq -r '.success')
  if [ "$success" != "true" ]; then
    error=$(echo "$join_response" | jq -r '.error // "Unknown error"')
    echo "ERROR: Failed to join game: $error"
    continue
  fi

  player_id=$(echo "$join_response" | jq -r '.data.players[0].id')

  # Save token for this player
  save_token_for_player "$player_id" "$token" "$PLAYER_NAME" 2>/dev/null

  # Store player info
  PLAYER_IDS+=("$player_id")
  PLAYER_NAMES+=("$PLAYER_NAME")
  PLAYER_TEAMS+=("Team Blue")
  PLAYER_TOKENS+=("$token")

  log "✓ ${PLAYER_NAME} joined (ID: ${player_id})"
done

echo ""
log "Game populated successfully!"
log "Total players: ${#PLAYER_IDS[@]}"
echo ""

# Display summary
echo -e "${YELLOW}=== Player Summary ===${NC}"
for i in "${!PLAYER_IDS[@]}"; do
  echo "  ${PLAYER_NAMES[$i]} (${PLAYER_TEAMS[$i]})"
  echo "    ID: ${PLAYER_IDS[$i]}"
  echo ""
done

log "All tokens saved to: $TOKEN_STORE"
echo ""

# Start monitoring if requested
if [[ "$AUTO_START" =~ ^[Yy]([Ee][Ss])?$ ]]; then
  log "Starting monitoring for all ${#PLAYER_IDS[@]} players..."
  echo ""

  for i in "${!PLAYER_IDS[@]}"; do
    log_info "Starting monitor for ${PLAYER_NAMES[$i]}..."
    "${SCRIPT_DIR}/codenames-play.sh" "$GAME_ID" "${PLAYER_NAMES[$i]}" "${PLAYER_TEAMS[$i]}" 10 &
    sleep 0.5
  done

  echo ""
  log "All players are now monitoring the game!"
  log "Use 'pkill -f codenames-play.sh' to stop all monitors"
else
  log "Skipping auto-start. You can manually start monitoring all players with:"
  echo ""
  for i in "${!PLAYER_IDS[@]}"; do
    echo "  ./scripts/codenames-play.sh $GAME_ID \"${PLAYER_NAMES[$i]}\" \"${PLAYER_TEAMS[$i]}\" 10 &"
  done
  echo ""
fi
