import { UnexpectedGameplayError } from "@backend/game/gameplay/errors/gameplay.errors";
import { PLAYER_ROLE } from "@codenames/shared/types";
import {
  GameAggregate,
  Round,
  HistoricalRound,
  Turn,
  Player,
  TurnPhase,
} from "./gameplay-state.types";

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

  /**
   * @returns The current active turn or null if it doesn't exist
   */
  getCurrentTurn(game: GameAggregate): Turn | null {
    if (!game.currentRound?.turns) return null;

    const activeTurn = game.currentRound.turns.find(
      (turn) => turn.status === "ACTIVE",
    );
    return activeTurn || null;
  },

  /**
   * @returns The current turn or throws if it doesn't exist
   */
  getCurrentTurnOrThrow(game: GameAggregate): Turn {
    const currentTurn = this.getCurrentTurn(game);
    if (!currentTurn) {
      throw new UnexpectedGameplayError("No active turn found");
    }
    return currentTurn;
  },

  /**
   * @returns The other team ID (assumes 2-team game)
   */
  getOtherTeamId(game: GameAggregate, currentTeamId: number): number {
    const otherTeam = game.teams.find((team) => team._id !== currentTeamId);
    if (!otherTeam) {
      throw new UnexpectedGameplayError("No other team found");
    }
    return otherTeam._id;
  },
};

/**
 * Computes the active turn phase based on turn state and round players.
 * - ACTIVE turn with no clue → CODEMASTER phase (playerName set)
 * - ACTIVE turn with clue → CODEBREAKER phase (playerName null — it's a group)
 * - COMPLETED turn → null
 */
export function computeTurnPhase(
  turn: { status: string; _teamId: number; clue?: unknown },
  players: Pick<Player, "publicName" | "teamName" | "_teamId" | "role" | "isAi">[],
): TurnPhase | null {
  if (turn.status !== "ACTIVE") return null;

  const role = turn.clue ? PLAYER_ROLE.CODEBREAKER : PLAYER_ROLE.CODEMASTER;
  const teamPlayers = players.filter(
    (p) => p._teamId === turn._teamId && p.role === role,
  );
  if (teamPlayers.length === 0) return null;

  const isAi = teamPlayers.some((p) => p.isAi);

  return {
    teamName: teamPlayers[0].teamName,
    role: role as "CODEMASTER" | "CODEBREAKER",
    isAi,
    playerName: role === PLAYER_ROLE.CODEMASTER ? (teamPlayers[0].publicName ?? null) : null,
  };
}
