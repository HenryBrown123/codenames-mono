import { RoleAssignmentCreator } from "@backend/common/data-access/repositories/players.repository";
import type { AssignRolesValidLobbyState } from "./assign-roles.rules";

/**
 * Type for role assignment input
 */
type RoleAssignmentInput = {
  playerId: number;
  roundId: number;
  roleId: number;
  teamId: number;
};

/**
 * Factory function that creates a random role assignment action with repository dependencies
 */
export const assignRolesRandomly = (
  assignPlayerRoles: RoleAssignmentCreator,
  getPreviousCodemasters: (gameId: number) => Promise<number[]>,
) => {
  /**
   * Randomly assigns roles for a pre-validated game state
   * Players who haven't been codemaster get priority, then random selection
   */
  return async (gameState: AssignRolesValidLobbyState) => {
    const assignments: RoleAssignmentInput[] = [];

    const previousCodemasters = await getPreviousCodemasters(gameState._id);

    for (const team of gameState.teams) {
      // Filter to players who haven't been codemaster yet
      const eligiblePlayers = team.players.filter(
        (player) => !previousCodemasters.includes(player._id),
      );

      // Select random codemaster from eligible players
      const selectedCodemaster =
        eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

      // Create role assignments for all players on this team
      team.players.forEach((player) => {
        assignments.push({
          playerId: player._id,
          roundId: gameState.currentRound!._id,
          roleId: player._id === selectedCodemaster._id ? 1 : 2, //TODO: Fix lookup from role code -> role name
          teamId: player._teamId,
        });
      });
    }

    // Persist role assignments to database
    return await assignPlayerRoles(assignments);
  };
};

export type RoleAssigner = ReturnType<typeof assignRolesRandomly>;
