// @ts-nocheck
import {
  Team,
  GameState,
  Turn,
  Round,
  Stage,
  Card,
} from "@codenames/shared/src/types/game-types";
import { TEAM } from "@codenames/shared/src/game/game-constants";

/**
 * Base class for handling commom gameplay state updates.
 */
export default class GameStateProcessor {
  protected gameState: GameState;

  /**
   * Creates a new instance of GameStateProcessor with a cloned game state.
   * @param {GameState} gameState - The current game state.
   */
  protected constructor(gameState: GameState) {
    this.gameState = structuredClone(gameState);
  }

  /**
   * Factory method to create a GameStateProcessor instance.
   *
   * @param {GameState} gameState - The current game state.
   * @returns {GameStateProcessor} - A new instance of GameStateProcessor
   */
  static from(gameState: GameState): GameStateProcessor {
    return new GameStateProcessor(gameState);
  }

  /**
   * Gets the current team playing the turn.
   * @returns {Team | undefined} - The current team.
   */
  protected get currentTeam(): Team | undefined {
    return this.lastRound?.team;
  }

  /**
   * Gets the opposing team of the current team.
   * @returns {Team | undefined} - The opposing team.
   */
  protected get otherTeam(): Team | undefined {
    return this.currentTeam === TEAM.RED ? TEAM.GREEN : TEAM.RED;
  }

  /**
   * Gets the word guessed in the current turn.
   * @returns {string | undefined} - The guessed word.
   */
  protected get guessedWord(): string | undefined {
    return this.latestTurn?.guessedWord;
  }

  /**
   * Gets the last round of the game.
   * @returns {Round | undefined} - The last round object.
   */
  protected get lastRound(): Round | undefined {
    return this.gameState.rounds.at(-1);
  }

  /**
   * Gets the latest turn of the current round.
   * @returns {Turn | undefined} - The latest turn in the current round.
   */
  protected get latestTurn(): Turn | undefined {
    return this.lastRound?.turns?.at(-1);
  }

  /**
   * Gets the total number of cards for the current team.
   * @returns {number} - The total number of cards for the current team.
   */
  protected get totalCardsForTeam(): number {
    return this.gameState.cards.filter(
      (card: Card) => card.team === this.currentTeam,
    ).length;
  }

  /**
   * Gets the number of selected cards for the current team.
   * @returns {number} - The number of selected cards for the current team.
   */
  protected get selectedCardsForTeam(): number {
    return this.gameState.cards.filter(
      (card: Card) => card.team === this.currentTeam && card.selected,
    ).length;
  }

  /**
   * Adds a new round to the game state for the given team.
   * @param {Team} team - The team for the new round.
   */
  addNewRound(team: Team): this {
    this.gameState.rounds.push({ team, turns: [] });
    return this;
  }

  /**
   * Updates the stage of the game.
   * @param {Stage} stage - The new stage to set.
   * @returns {GameStateProcessor} - The updated instance for chaining.
   */
  updateStage(stage: Stage): this {
    this.gameState.stage = stage;
    return this;
  }

  /**
   * Finalizes and returns the updated game state.
   * @returns {GameState} - The finalized game state.
   */
  finalize(): GameState {
    return this.gameState;
  }
}
