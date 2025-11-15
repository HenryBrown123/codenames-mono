#!/bin/bash

# Start monitoring for all players in a game that have saved tokens

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/codenames-token.sh"

GAME_ID="${1}"

if [ -z "$GAME_ID" ]; then
  echo "Usage: $0 <GAME_ID>"
  echo ""
  echo "Starts monitoring for all players that have tokens saved in the token store"
  exit 1
fi

# Get list of all players with tokens
init_token_store
player_ids=$(jq -r 'keys[]' "$TOKEN_STORE")

if [ -z "$player_ids" ]; then
  echo "No players found in token store"
  exit 1
fi

echo "Starting monitors for all players with saved tokens..."
echo ""

# For each player, get their info from the DB and start monitoring
for player_id in $player_ids; do
  # Get player name and team from database
  player_info=$(psql postgresql://postgres:dev@localhost:5432/postgres -t -c "
    SELECT p.public_name, t.team_name
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN games g ON t.game_id = g.id
    WHERE p.public_id = '$player_id' AND g.public_id = '$GAME_ID'
  " 2>/dev/null)

  if [ -z "$player_info" ]; then
    continue
  fi

  player_name=$(echo "$player_info" | awk '{print $1}')
  team_name=$(echo "$player_info" | awk '{print $3}')

  echo "Starting monitor: $player_name ($team_name)"
  "${SCRIPT_DIR}/codenames-play.sh" "$GAME_ID" "$player_name" "Team $team_name" 10 &
  sleep 0.5
done

echo ""
echo "All monitors started!"
echo "Use 'pkill -f codenames-play.sh' to stop all monitors"
