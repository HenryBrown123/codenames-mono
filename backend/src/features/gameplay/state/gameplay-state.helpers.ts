import { UnexpectedGameplayError } from "../errors/gameplay.errors";
import { GameAggregate, Round } from "./gameplay-state.types";

/**
 * Collection of pure accessor functions for retrieving derived game state
 */
export const complexProperties = {
  /**
   * @returns The most recently started round or null if no rounds exist
   */
  getLatestRound(game: GameAggregate): Round | null {
    if (!game.rounds || game.rounds.length === 0) return null;
    return game.rounds[game.rounds.length - 1];
  },

  /**
   * @returns The most recently started round or throws if no rounds exist
   */
  getLatestRoundOrThrow(game: GameAggregate): Round {
    const latestRound = this.getLatestRound(game);
    if (!latestRound) throw new UnexpectedGameplayError("No rounds found");
    return latestRound;
  },

  /**
   * @returns The most recently started round or null if no rounds exist
   */
  getTeamCount(game: GameAggregate): number {
    return game.teams ? game.teams.length : 0;
  },

  /**
   * @returns Total number of rounds in the game
   */
  getRoundCount(game: GameAggregate): number {
    if (!game.rounds || game.rounds.length === 0) return 0;
    return game.rounds.length;
  },

  /**
   * @param roundNumber - Round sequence number
   * @returns The requested round or null if not found
   */
  findRoundByNumber(game: GameAggregate, roundNumber: number): Round | null {
    if (!game.rounds || game.rounds.length === 0) return null;
    return (
      game.rounds.find((round) => round.roundNumber === roundNumber) || null
    );
  },
};
