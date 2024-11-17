import { GameState } from "@game/game-common-types";
import { STAGE } from "@game/game-common-constants";
import GameStateProcessor from "./gameplay-state-common";
import CodebreakerStateProcessor from "./gameplay-state-codebreaker";

/**
 * Processes the 'intro' stage and returns an updated game object.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the intro stage.
 */
export function processIntroStage(inputGameState: GameState): GameState {
  return GameStateProcessor.from(inputGameState)
    .updateStage(STAGE.CODEMASTER)
    .finalize();
}

/**
 * Processes the 'codemaster' stage and returns an updated game object.
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the codemaster stage.
 */
export function processCodemasterStage(inputGameState: GameState): GameState {
  return GameStateProcessor.from(inputGameState)
    .updateStage(STAGE.CODEBREAKER)
    .finalize();
}

/**
 * Processes the 'codebreaker' stage and returns an updated game object... uses its own modifier object
 * due to more state update logic needed, (different strategies for different outcomes)
 *
 * @param {GameState} inputGameState - The current state of the game.
 * @returns {GameState} - The updated game state after processing the codebreaker stage.
 */
export function processCodebreakerStage(inputGameState: GameState): GameState {
  return CodebreakerStateProcessor.from(inputGameState)
    .markCardAsSelected()
    .updateTurnOutcome() // Determine and store the outcome of the turn
    .executeCodebreakerTurnStrategy() // Apply strategy logic based on the turn outcome
    .finalize();
}

/*

{
  "success": true,
  "game": {
    "stage": "codebreaker",
    "cards": [
      {
        "word": "Coop",
        "team": "red",
        "selected": false
      },
      {
        "word": "Bruise",
        "team": "red",
        "selected": false
      },
      {
        "word": "Aristocrat",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Chef",
        "team": "assassin",
        "selected": false
      },
      {
        "word": "Thief",
        "team": "green",
        "selected": false
      },
      {
        "word": "Pendulum",
        "team": "green",
        "selected": false
      },
      {
        "word": "Elm",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Loyalty",
        "team": "red",
        "selected": false
      },
      {
        "word": "Battery",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Shampoo",
        "team": "red",
        "selected": false
      },
      {
        "word": "Tinting",
        "team": "green",
        "selected": false
      },
      {
        "word": "Queen",
        "team": "red",
        "selected": false
      },
      {
        "word": "Hatch",
        "team": "green",
        "selected": false
      },
      {
        "word": "Aisle",
        "team": "red",
        "selected": false
      },
      {
        "word": "Nest",
        "team": "red",
        "selected": false
      },
      {
        "word": "Baby-Sitter",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Money",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Mold",
        "team": "green",
        "selected": false
      },
      {
        "word": "Tree",
        "team": "green",
        "selected": false
      },
      {
        "word": "Salt",
        "team": "green",
        "selected": false
      },
      {
        "word": "Ligament",
        "team": "bystander",
        "selected": false
      },
      {
        "word": "Broken",
        "team": "green",
        "selected": false
      },
      {
        "word": "Riddle",
        "team": "red",
        "selected": false
      },
      {
        "word": "Speakers",
        "team": "red",
        "selected": true
      },
      {
        "word": "Whiplash",
        "team": "bystander",
        "selected": false
      }
    ],
    "rounds": [
      {
        "team": "red",
        "codeword": "testicle",
        "guessesAllowed": 3,
        "turns": [
          {
            "guessedWord": "Speakers",
            "outcome": "CORRECT_TEAM_CARD"
          }
        ]
      }
    ]
  }
}


*/
