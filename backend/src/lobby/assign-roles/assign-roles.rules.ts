import { GAME_STATE, ROUND_STATE, PLAYER_ROLE } from "@codenames/shared/types";
import { LobbyAggregate } from "../state/lobby-state.types";
import { 
  LobbyValidationResult, 
  ValidatedLobbyState,
  createBrandedResult 
} from "../state/lobby-state.validation";

/**
 * Rules for validating role assignment in the lobby context
 */
const roleAssignmentRules = {
  isRoundInSetupState(lobby: LobbyAggregate): boolean {
    return lobby.currentRound?.status === ROUND_STATE.SETUP;
  },

  hasNoExistingRoles(lobby: LobbyAggregate): boolean {
    if (!lobby.currentRound?.players) return true;
    return lobby.currentRound.players.every(
      (player) => !player.role || player.role === PLAYER_ROLE.NONE
    );
  },

  hasMinimumPlayersPerTeam(lobby: LobbyAggregate): boolean {
    return lobby.teams.every((team) => team.players.length >= 2);
  },
};

/**
 * Type for a validated lobby state during role assignment
 */
export type AssignRolesValidLobbyState = ValidatedLobbyState<"assignRoles"> & {
  currentRound: NonNullable<LobbyAggregate['currentRound']>;
};

/**
 * Validates if roles can be assigned
 */
export function validate(
  lobby: LobbyAggregate
): LobbyValidationResult<AssignRolesValidLobbyState> {
  const errors: Array<{ path?: string[]; message: string }> = [];

  if (!lobby.currentRound) {
    errors.push({
      path: ["currentRound"],
      message: "No current round to assign roles to",
    });
  }

  if (!roleAssignmentRules.isRoundInSetupState(lobby)) {
    errors.push({
      path: ["currentRound", "status"],
      message: "Round must be in SETUP state to assign roles",
    });
  }

  if (!roleAssignmentRules.hasNoExistingRoles(lobby)) {
    errors.push({
      path: ["currentRound", "players"],
      message: "Roles have already been assigned for this round",
    });
  }

  if (!roleAssignmentRules.hasMinimumPlayersPerTeam(lobby)) {
    errors.push({
      path: ["teams"],
      message: "Each team must have at least 2 players to assign roles",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: createBrandedResult(lobby, "assignRoles") as AssignRolesValidLobbyState };
}