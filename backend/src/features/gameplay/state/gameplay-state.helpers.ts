import { UnexpectedGameplayError } from "../errors/gameplay.errors";
import { GameAggregate, Round, HistoricalRound } from "./gameplay-state.types";

/**
 * Collection of pure accessor functions for retrieving derived game state
 */
export const complexProperties = {
  /**
   * @returns The current round or null if it doesn't exist
   */
  getLatestRound(game: GameAggregate): Round | null {
    return game.currentRound || null;
  },

  /**
   * @returns The current round or throws if it doesn't exist
   */
  getLatestRoundOrThrow(game: GameAggregate): Round {
    const currentRound = this.getLatestRound(game);
    if (!currentRound)
      throw new UnexpectedGameplayError("No current round found");
    return currentRound;
  },

  /**
   * @returns The number of teams in the game
   */
  getTeamCount(game: GameAggregate): number {
    return game.teams ? game.teams.length : 0;
  },

  /**
   * @returns Total number of rounds in the game (current + historical)
   */
  getRoundCount(game: GameAggregate): number {
    const historicalCount = game.historicalRounds?.length || 0;
    const currentCount = game.currentRound ? 1 : 0;
    return historicalCount + currentCount;
  },

  /**
   * @param roundNumber - Round sequence number
   * @returns The requested round (current or historical) or null if not found
   */
  findRoundByNumber(
    game: GameAggregate,
    roundNumber: number,
  ): Round | HistoricalRound | null {
    // Check current round first
    if (game.currentRound && game.currentRound.number === roundNumber) {
      return game.currentRound;
    }

    // Then check historical rounds
    if (game.historicalRounds && game.historicalRounds.length > 0) {
      return (
        game.historicalRounds.find((round) => round.number === roundNumber) ||
        null
      );
    }

    return null;
  },

  /**
   * @returns The winning team info of the specified round, or null if not found or not completed
   */
  getRoundWinningTeam(
    game: GameAggregate,
    roundNumber: number,
  ): { _winningTeamId: number; winningTeamName: string } | null {
    const winner = game.historicalRounds.find(
      (round) => round.number === roundNumber,
    );

    if (!winner?._winningTeamId || !winner?.winningTeamName) {
      return null;
    }

    return {
      _winningTeamId: winner._winningTeamId,
      winningTeamName: winner.winningTeamName,
    };
  },
};
