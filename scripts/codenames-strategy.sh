#!/bin/bash

# AI Strategy for Codenames
# Provides intelligent decision-making for CODEMASTER and CODEBREAKER roles

# CODEMASTER: Generate a clue for team cards
generate_clue() {
  local game_state="$1"

  # Extract my team's unselected cards
  local my_team=$(echo "$game_state" | jq -r '.data.playerContext.teamName')
  local my_cards=$(echo "$game_state" | jq -r \
    --arg team "$my_team" \
    '[.data.currentRound.cards[] | select(.teamName == $team and .selected == false) | .word]')

  # Extract danger cards (assassin and other team)
  local danger_cards=$(echo "$game_state" | jq -r \
    --arg team "$my_team" \
    '[.data.currentRound.cards[] | select(.teamName != $team or .cardType == "ASSASSIN") | select(.selected == false) | .word]')

  local card_count=$(echo "$my_cards" | jq 'length')

  if [ "$card_count" -eq 0 ]; then
    echo "null"
    return 1
  fi

  # Simple strategy: pick a semantic category
  # For now, we'll use simple heuristics based on word characteristics
  local cards_list=$(echo "$my_cards" | jq -r '.[]' | tr '\n' ', ' | sed 's/,$//')

  # Try to find common patterns (this is a simple implementation)
  # In a real implementation, you'd use word embeddings or semantic analysis
  local clue_word="RELATED"
  local target_count=2

  # Limit to available cards
  if [ "$card_count" -lt "$target_count" ]; then
    target_count="$card_count"
  fi

  echo "INFO: My team ($my_team) cards: $cards_list" >&2
  echo "INFO: Giving clue: $clue_word for $target_count cards" >&2

  jq -n \
    --arg word "$clue_word" \
    --arg count "$target_count" \
    '{word: $word, targetCount: ($count | tonumber)}'
}

# CODEBREAKER: Choose best card based on clue
choose_card() {
  local game_state="$1"

  # Extract clue information
  local clue=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].clue.word // empty')
  local target_count=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].clue.targetCardCount // 0')

  # Get unselected cards
  local available_cards=$(echo "$game_state" | jq -r \
    '[.data.currentRound.cards[] | select(.selected == false) | .word]')

  local card_count=$(echo "$available_cards" | jq 'length')

  if [ "$card_count" -eq 0 ]; then
    echo "null"
    return 1
  fi

  # Simple strategy: pick first available card
  # In a real implementation, you'd use semantic similarity to the clue
  local chosen_card=$(echo "$available_cards" | jq -r '.[0]')

  local cards_list=$(echo "$available_cards" | jq -r '.[]' | tr '\n' ', ' | sed 's/,$//')

  echo "INFO: Clue is '$clue' for $target_count cards" >&2
  echo "INFO: Available cards: $cards_list" >&2
  echo "INFO: Choosing: $chosen_card" >&2

  jq -n --arg card "$chosen_card" '{card: $card}'
}

# Decide if it's my turn to act
is_my_turn() {
  local game_state="$1"

  local my_team=$(echo "$game_state" | jq -r '.data.playerContext.teamName // empty')
  local my_role=$(echo "$game_state" | jq -r '.data.playerContext.role // empty')
  local turn_team=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].teamName // empty')
  local has_clue=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].clue != null')
  local guesses_left=$(echo "$game_state" | jq -r '.data.currentRound.turns[-1].guessesRemaining // 0')

  # Not my team's turn
  if [ "$my_team" != "$turn_team" ]; then
    echo "false"
    return 0
  fi

  # CODEMASTER: can give clue if no clue exists yet
  if [ "$my_role" = "CODEMASTER" ] && [ "$has_clue" = "false" ]; then
    echo "CODEMASTER"
    return 0
  fi

  # CODEBREAKER: can guess if clue exists and guesses remain
  if [ "$my_role" = "CODEBREAKER" ] && [ "$has_clue" = "true" ] && [ "$guesses_left" -gt 0 ]; then
    echo "CODEBREAKER"
    return 0
  fi

  echo "false"
}

# Export functions
export -f generate_clue
export -f choose_card
export -f is_my_turn
