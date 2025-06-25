import { GAME_STATE, ROUND_STATE } from "@codenames/shared/types";
import { LobbyAggregate } from "../state/lobby-state.types";
import { 
  LobbyValidationResult, 
  ValidatedLobbyState,
  createBrandedResult 
} from "../state/lobby-state.validation";

/**
 * Rules for validating round start in the lobby context
 */
const roundStartRules = {
  isRoundInSetupState(lobby: LobbyAggregate): boolean {
    return lobby.currentRound?.status === ROUND_STATE.SETUP;
  },

  hasCardsDealt(lobby: LobbyAggregate): boolean {
    return (
      lobby.currentRound?.cards !== undefined &&
      lobby.currentRound.cards.length > 0
    );
  },

  hasMinimumPlayersPerTeam(lobby: LobbyAggregate): boolean {
    return lobby.teams.every((team) => team.players.length >= 2);
  },

  isGameInProgress(lobby: LobbyAggregate): boolean {
    return lobby.status === GAME_STATE.IN_PROGRESS;
  },
};

/**
 * Type for a validated lobby state during round start
 */
export type StartRoundValidLobbyState = ValidatedLobbyState<"startRound"> & {
  currentRound: NonNullable<LobbyAggregate['currentRound']>;
};

/**
 * Validates if a round can be started
 */
export function validate(
  lobby: LobbyAggregate
): LobbyValidationResult<StartRoundValidLobbyState> {
  const errors: Array<{ path?: string[]; message: string }> = [];

  if (!lobby.currentRound) {
    errors.push({
      path: ["currentRound"],
      message: "No current round to start",
    });
  }

  if (!roundStartRules.isGameInProgress(lobby)) {
    errors.push({
      path: ["status"],
      message: "Game must be in IN_PROGRESS state to start a round",
    });
  }

  if (!roundStartRules.isRoundInSetupState(lobby)) {
    errors.push({
      path: ["currentRound", "status"],
      message: `Round must be in SETUP state, current: ${lobby.currentRound?.status}`,
    });
  }

  if (!roundStartRules.hasCardsDealt(lobby)) {
    errors.push({
      path: ["currentRound", "cards"],
      message: "Cards must be dealt before starting the round",
    });
  }

  if (!roundStartRules.hasMinimumPlayersPerTeam(lobby)) {
    errors.push({
      path: ["teams"],
      message: "Each team must have at least 2 players",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: createBrandedResult(lobby, "startRound") as StartRoundValidLobbyState };
}