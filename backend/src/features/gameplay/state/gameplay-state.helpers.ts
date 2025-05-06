import { GameAggregate, Round } from "./gameplay-state.types";

/**
 * A module of pure accessor functions for game state
 */
export const gameAccessors = {
  /**
   * Gets the most recently started round in the game
   */
  getLatestRound(game: GameAggregate): Round | null {
    if (!game.rounds || game.rounds.length === 0) return null;
    return game.rounds[game.rounds.length - 1];
  },

  /**
   * Gets the current round sequence number
   */
  getRoundCount(game: GameAggregate): number {
    if (!game.rounds || game.rounds.length === 0) return 0;
    return game.rounds.length;
  },

  /**
   * Finds a specific round by its sequence number
   */
  findRoundByNumber(game: GameAggregate, roundNumber: number): Round | null {
    if (!game.rounds || game.rounds.length === 0) return null;
    return (
      game.rounds.find((round) => round.roundNumber === roundNumber) || null
    );
  },
};
